import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi, formatDateToISO } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import ItemDetailsForm from '@argus/shared-ui/src/components/Shared/Forms/ItemDetailsForm'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

export default function PurchaseRquisitionForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const { userDefaults } = useContext(DefaultsContext)
  const [maxSeqNo, setMaxSeqNo] = useState(1)
  const defaultPlant = parseInt(userDefaults?.list?.find(obj => obj.key === 'plantId')?.value)
  const userId = getStorageData('userData').userId

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.PurchaseRequisition
  })

  useSetWindow({ title: labels?.purchaseRequisition, window })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.PurchaseRequisition,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: PurchaseRepository.PurchaseRequisition.page
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      dtId: null,
      dgId: null,
      reference: '',
      status: 1,
      date: new Date(),
      procurementType: null,
      siteId: null,
      deliveryDate: null,
      notes: '',
      vendorId: null,
      plantId: defaultPlant,
      departmentId: null,
      releaseStatus: null,
      wip: 1,
      totalCost: 0,
      totalQty: 0,
      items: {}
    },
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      procurementType: yup.string().required()
    }),
    onSubmit: async values => {
      const obj = { ...values }
      delete obj.items

      const res = await postRequest({
        extension: PurchaseRepository.PurchaseRequisition.set,
        record: JSON.stringify({
          ...obj,
          date: obj?.date ? formatDateToApi(obj?.date) : null,
          deliveryDate: obj?.deliveryDate ? formatDateToISO(new Date(obj.deliveryDate)) : null
        })
      })

      invalidate()
      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      await refetchForm(res?.recordId)
    }
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip == 2
  const isCancelled = formik.values.status == -1

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.PurchaseRequisition,
        recordId: formik.values.recordId
      }
    })
  }

  async function onClose() {
    const res = await postRequest({
      extension: PurchaseRepository.PurchaseRequisition.close,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Closed)
    invalidate()
    refetchForm(res?.recordId)
  }

  async function onReopen() {
    const res = await postRequest({
      extension: PurchaseRepository.PurchaseRequisition.reopen,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    refetchForm(res?.recordId)
  }

  async function onCancel() {
    const res = await postRequest({
      extension: PurchaseRepository.PurchaseRequisition.cancel,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Cancelled)
    invalidate()
    refetchForm(res?.recordId)
  }

  const actions = [
    {
      key: 'Attachment',
      condition: true,
      onClick: 'onClickAttachment',
      disabled: !editMode
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode || isCancelled
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || isCancelled
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed || isCancelled
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: onCancel,
      disabled: !editMode || isCancelled
    }
  ]

  const columns = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: labels.site,
      flex: 1
    },
    {
      field: 'muName',
      headerName: labels.measurement,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'deliveryDate',
      headerName: labels.deliveryDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'vendorName',
      headerName: labels.vendor,
      flex: 1
    },
    {
      field: 'unitCost',
      headerName: labels.unitCost,
      flex: 1,
      type: 'number'
    },
    {
      field: 'totalCost',
      headerName: labels.totalCost,
      flex: 1,
      type: 'number'
    }
  ]

  async function getUserInfo() {
    const res = await getRequest({
      extension: SystemRepository.Users.get,
      parameters: `_recordId=${userId}`
    })

    return res?.record
  }

  async function getDefaultDepartment(employeeId) {
    if (!employeeId) return

    const res = await getRequest({
      extension: EmployeeRepository.Employee.get1,
      parameters: `_recordId=${employeeId}`
    })

    return res?.record
  }

  async function refetchForm(recordId) {
    const requisitionData = await getRequisitionData(recordId)
    const itemDetails = await getItemDetails(recordId)
    fillForm(requisitionData, itemDetails)
  }

  async function getRequisitionData(recordId) {
    if (!recordId) return

    const requisitionData = await getRequest({
      extension: PurchaseRepository.PurchaseRequisition.get,
      parameters: `_recordId=${recordId}`
    })

    return requisitionData?.record
  }

  async function getItemDetails(recordId) {
    if (!recordId) return

    const itemDetails = await getRequest({
      extension: PurchaseRepository.RequisitionDetail.qry,
      parameters: `_trxId=${recordId}`
    })

    return itemDetails
  }

  function fillForm(requisitionData, itemDetails) {
    let headerTotalCost = 0
    let headerTotalQty = 0

    const modifiedList = itemDetails?.list?.map(item => {
      headerTotalCost += item?.unitCost * item?.qty
      headerTotalQty += item?.qty || 0
      if (item?.seqNo > maxSeqNo) setMaxSeqNo(item?.seqNo)

      return {
        ...item,
        totalCost: (item?.unitCost * item?.qty || 0).toFixed(2),
        unitCost: (item?.unitCost || 0).toFixed(2),
        qty: (item?.qty || 0).toFixed(2)
      }
    })

    formik.setValues({
      ...requisitionData,
      date: formatDateFromApi(requisitionData?.date),
      deliveryDate: formatDateFromApi(requisitionData?.deliveryDate),
      totalCost: headerTotalCost.toFixed(2),
      totalQty: headerTotalQty.toFixed(2),
      items: { list: modifiedList }
    })
  }

  const openPurchaseDetails = obj => {
    stack({
      Component: ItemDetailsForm,
      props: {
        recordId,
        labels,
        maxAccess,
        readOnlyField: isClosed || isCancelled,
        maxSeqNo,
        seqNo: obj?.seqNo,
        siteId: formik.values.siteId,
        refetchTable: refetchForm
      },
      width: 800,
      height: 450,
      title: labels.purchaseDetails
    })
  }

  const delPurchaseDetails = async obj => {
    await postRequest({
      extension: PurchaseRepository.RequisitionDetail.del,
      record: JSON.stringify(obj)
    })
    refetchForm(recordId)
    toast.success(platformLabels.Deleted)
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) refetchForm(recordId)
      else {
        const userInfo = await getUserInfo()
        const department = await getDefaultDepartment(userInfo?.employeeId)
        formik.setFieldValue('departmentId', department?.departmentId || null)
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.PurchaseRequisition}
      functionId={SystemFunction.PurchaseRequisition}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      previewReport={editMode}
      disabledSubmit={isClosed || isCancelled}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.PurchaseRequisition}`}
                    filter={!editMode ? dt => dt.activeStatus === 1 : undefined}
                    name='dtId'
                    label={labels.docType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isClosed || isCancelled}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    maxAccess={!editMode && maxAccess}
                    onChange={async (event, newValue) => {
                      await changeDT(newValue)
                      formik.setFieldValue('dtId', newValue?.recordId || null)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik?.values?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    readOnly={isClosed || isCancelled}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    required
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', null)}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.PROCUREMENT_TYPE}
                    name='procurementType'
                    label={labels.procurementType}
                    readOnly={isClosed || isCancelled}
                    values={formik.values}
                    valueField='key'
                    displayField='value'
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('procurementType', newValue?.key || null)
                    }}
                    error={formik.touched.procurementType && Boolean(formik.errors.procurementType)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={PurchaseRepository.Vendor.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='vendorId'
                    label={labels.vendor}
                    form={formik}
                    readOnly={isClosed || isCancelled}
                    displayFieldWidth={2}
                    valueShow='vendorRef'
                    secondValueShow='vendorName'
                    maxAccess={maxAccess}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('vendorName', newValue?.name || '')
                      formik.setFieldValue('vendorRef', newValue?.reference || '')
                      formik.setFieldValue('vendorId', newValue?.recordId || null)
                    }}
                    errorCheck={'vendorId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={companyStructureRepository.DepartmentFilters.qry}
                    parameters={`_filter=&_size=1000&_startAt=0&_type=0&_activeStatus=0&_sortBy=recordId`}
                    name='departmentId'
                    readOnly={isClosed || isCancelled}
                    label={labels.department}
                    values={formik.values}
                    columnsInDropDown={[
                      { key: 'departmentRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    displayField={['departmentRef', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('departmentId', newValue?.recordId || null)
                    }}
                    error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <CustomButton
                    onClick={openPurchaseDetails}
                    style={{ border: '1px solid #4eb558' }}
                    color={'transparent'}
                    image={'add.png'}
                    disabled={!editMode || isClosed}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='siteId'
                    readOnly={isClosed || isCancelled}
                    label={labels.site}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('siteId', newValue?.recordId || null)
                    }}
                    error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='deliveryDate'
                    label={labels.deliveryDate}
                    readOnly={isClosed || isCancelled}
                    value={formik?.values?.deliveryDate}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('deliveryDate', null)}
                    error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='plantId'
                    label={labels.plant}
                    readOnly={isClosed || isCancelled}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('plantId', newValue?.recordId || null)
                    }}
                    error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik?.values?.notes}
                    rows={2.5}
                    readOnly={isClosed || isCancelled}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            name='itemTable'
            columns={columns}
            gridData={formik.values.items}
            rowId={['recordId']}
            onEdit={openPurchaseDetails}
            onDelete={isClosed || isCancelled ? undefined : delPurchaseDetails}
            maxAccess={maxAccess}
            pagination={false}
          />
        </Grow>
        <Fixed>
          <Grid container justifyContent='flex-end' spacing={2}>
            <Grid item>
              <CustomNumberField name='totalQty' label={labels.totalQty} value={formik.values.totalQty} readOnly />
            </Grid>
            <Grid item>
              <CustomNumberField name='totalCost' label={labels.totalCost} value={formik.values.totalCost} readOnly />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

PurchaseRquisitionForm.width = 1100
PurchaseRquisitionForm.height = 700
