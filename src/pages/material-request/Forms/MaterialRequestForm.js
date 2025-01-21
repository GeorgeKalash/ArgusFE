import { Grid } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { useWindow } from 'src/windows'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { useError } from 'src/error'
import { companyStructureRepository } from 'src/repositories/companyStructureRepository'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'

export default function MaterialRequestForm({ labels, maxAccess: access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  const [measurements, setMeasurements] = useState([])
  const filteredMeasurements = useRef([])

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.MaterialRequest,
    access,
    enabled: !recordId
  })

  const initialValues = {
    recordId: null,
    functionId: SystemFunction.MaterialRequest,
    reference: '',
    dtId: documentType?.dtId,
    siteId: null,
    siteName: '',
    date: new Date(),
    fromSiteId: '',
    departmentId: null,
    departmentName: '',
    statusName: '',
    rsName: '',
    wipName: '',
    notes: '',
    status: 1,
    wip: 1,
    items: [
      {
        id: 1,
        requestId: recordId || 0,
        seqNo: 1,
        sku: '',
        itemName: null,
        itemId: null,
        qty: 0,
        notes: '',
        onHandSite: null,
        onHandGlobal: null,
        deliveredQty: null,
        deliveryStatus: '',
        muId: null,
        muQty: '',
        muRef: '',
        muName: '',
        msId: null
      }
    ]
  }

  const invalidate = useInvalidate({
    endpointId: IVReplenishementRepository.MaterialReplenishment.page
  })

  async function getDefaultFromSiteId() {
    if (editMode) {
      return
    }

    if (documentType?.dtId) {
      return
    } else {
      const defaultFromSiteId = defaultsData?.list?.find(({ key }) => key === 'de_siteId')

      if (defaultFromSiteId?.value) formik.setFieldValue('fromSiteId', parseInt(defaultFromSiteId?.value))
    }
  }

  const { formik } = useForm({
    initialValues,
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      fromSiteId: yup.string().required(),
      items: yup
        .array()
        .of(
          yup.object().shape({
            sku: yup.string().required(),
            qty: yup.string().required(),
            msId: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: async values => {
      const copy = { ...values }
      delete copy.items
      copy.date = !!copy.date ? formatDateToApi(copy.date) : null

      const updatedRows = formik?.values?.items.map((transferDetail, index) => {
        return {
          ...transferDetail,
          seqNo: index + 1,
          requestId: formik.values.recordId || 0
        }
      })
      if (values.fromSiteId === values.siteId) {
        stackError({
          message: labels.errorMessage
        })

        return
      }

      const resultObject = {
        header: copy,
        items: updatedRows
      }

      const res = await postRequest({
        extension: IVReplenishementRepository.MaterialReplenishment.set2,
        record: JSON.stringify(resultObject)
      })

      if (!values.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', res.recordId)

        const res2 = await getData(res.recordId)
        const res3 = await getDataGrid(res.recordId)

        formik.setValues({
          ...res2.record,
          items: res3
        })

        invalidate()
      } else toast.success(platformLabels.Edited)
    }
  })

  async function getFilteredMU(itemId) {
    if (!itemId) return

    const currentItemId = formik.values.items?.find(item => parseInt(item.itemId) === itemId)?.msId

    const arrayMU = measurements?.filter(item => item.msId === currentItemId) || []
    filteredMeasurements.current = arrayMU
  }
  const isClosed = formik.values.wip === 2
  const isCancelled = formik.values.status == -1
  const editMode = !!formik.values.recordId

  const getMeasurementUnits = async () => {
    return await getRequest({
      extension: InventoryRepository.MeasurementUnit.qry,
      parameters: `_msId=0`
    })
  }

  async function getItem(itemId) {
    const res = await getRequest({
      extension: InventoryRepository.Item.get,
      parameters: `_recordId=${itemId}`
    })

    return res?.record
  }

  async function setOnHandSite(itemId) {
    const res = await getRequest({
      extension: InventoryRepository.Availability.qry,
      parameters: `_siteId=${formik.values.fromSiteId || 0}&_itemId=${itemId}&_startAt=0&_pageSize=1000`
    })

    if (res.count == 0) {
      formik.setFieldValue('onHandSite', null)

      return null
    } else if (res.count > 0 && res.list[0].siteId != 0) {
      formik.setFieldValue('onHandSite', res.list[0].onhand)

      return res.list[0].onhand
    } else {
      formik.setFieldValue('onHandSite', null)

      return null
    }
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'recordId',
        displayField: 'sku',
        mandatory: true,
        readOnly: isClosed || isCancelled,
        displayFieldWidth: 3,
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'msId', to: 'msId' },
          { from: 'onHandGlobal', to: 'onHandGlobal' },
          { from: 'deliveredQty', to: 'deliveredQty' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' },
          { key: 'flName', value: 'flName' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.itemId) {
          update({
            details: false
          })

          return
        }

        if (newRow?.itemId) {
          const itemInfo = await getItem(newRow.itemId)
          getFilteredMU(newRow?.itemId)
          const filteredMeasurements = measurements?.filter(item => item.msId === itemInfo?.msId)
          const onHandSite = await setOnHandSite(newRow?.itemId)
          update({
            msId: itemInfo?.msId,
            onHandSite: onHandSite,
            muRef: filteredMeasurements?.[0]?.reference,
            muId: filteredMeasurements?.[0]?.recordId
          })
        }
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.muId,
      name: 'muRef',
      props: {
        store: filteredMeasurements?.current,
        displayField: 'reference',
        valueField: 'recordId',
        readOnly: isClosed || isCancelled,
        mapping: [
          { from: 'reference', to: 'muRef' },
          { from: 'qty', to: 'muQty' },
          { from: 'recordId', to: 'muId' }
        ]
      },
      async onChange({ row: { update, newRow } }) {
        const filteredItems = filteredMeasurements?.current.filter(item => item.recordId === newRow?.muId)
        const qtyInBase = newRow?.qty * filteredItems?.muQty ?? 0

        update({
          qtyInBase,
          muQty: newRow?.muQty
        })
      },
      propsReducer({ row, props }) {
        return { ...props, store: filteredMeasurements?.current }
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      props: {
        readOnly: isClosed || isCancelled
      },
      async onChange({ row: { update, newRow } }) {
        if (newRow) {
          const qtyInBase = newRow?.qty * newRow?.muQty ?? 0

          update({
            qtyInBase
          })
        }
      }
    },
    {
      component: 'numberfield',
      label: labels.onHandSite,
      name: 'onHandSite',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.notes,
      name: 'notes'
    }
  ]

  async function getData(recordId) {
    const res = await getRequest({
      extension: IVReplenishementRepository.MaterialReplenishment.get,
      parameters: `_requestId=${recordId}&_params=`
    })

    res.record.date = formatDateFromApi(res?.record?.date)

    return res
  }

  async function refetchForm(recordId) {
    const res = await getData(recordId)
    const res2 = await getDataGrid(recordId)

    formik.setValues({
      ...res.record,
      recordId,
      items: res2?.list?.map(item => ({
        ...item,
        id: item.seqNo
      }))
    })
  }

  const onClose = async recId => {
    await postRequest({
      extension: IVReplenishementRepository.MaterialReplenishment.close,
      record: JSON.stringify({ recordId: recId })
    })

    toast.success(platformLabels.Closed)
    invalidate()

    const res = await getData(recId)
    const res3 = await getDataGrid(recId)

    formik.setValues({
      ...res.record,
      items: res3
    })
  }

  const onReopen = async recId => {
    const copy = { ...formik.values }
    delete copy.items
    copy.date = !!copy.date ? formatDateToApi(copy.date) : null

    await postRequest({
      extension: IVReplenishementRepository.MaterialReplenishment.reopen,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    const res = await getData(recId)
    const res3 = await getDataGrid(recId)

    formik.setValues({
      ...res.record,
      items: res3
    })
  }

  const onCancel = async recId => {
    const copy = { ...formik.values }
    delete copy.items
    copy.date = !!copy.date ? formatDateToApi(copy.date) : null

    await postRequest({
      extension: IVReplenishementRepository.MaterialReplenishment.cancel,
      record: JSON.stringify(copy)
    })

    toast.success(platformLabels.Cancelled)
    invalidate()
    const res = await getData(recId)
    const res3 = await getDataGrid(recId)

    formik.setValues({
      ...res.record,
      items: res3
    })
  }

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.MaterialTransfer,
        recordId: formik.values.recordId
      },
      width: 950,
      title: labels.workflow
    })
  }

  const actions = [
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed || !isCancelled
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: () => onClose(formik.values.recordId),
      disabled: isClosed || !editMode || isCancelled
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: () => onReopen(formik.values.recordId),
      disabled: !isClosed || !editMode || isCancelled
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'Cancel',
      condition: true,
      onClick: () => onCancel(formik.values.recordId),
      disabled: !editMode || isCancelled
    }
  ]

  async function getDataGrid(recordId) {
    const dataGrid = await getRequest({
      extension: IVReplenishementRepository.OrderItem.qry,
      parameters: `_requestId=${recordId}&_functionId=${SystemFunction.MaterialRequest}&_params=&_startAt=0`
    })

    const updatedRequests = await Promise.all(
      dataGrid.list.map(async item => {
        const onHandSite = await setOnHandSite(item?.itemId)

        return {
          ...item,
          id: item.seqNo,
          onHandSite
        }
      })
    )

    return updatedRequests
  }

  useEffect(() => {
    ;(async function () {
      const muList = await getMeasurementUnits()
      setMeasurements(muList?.list)
      getDefaultFromSiteId()

      if (documentType?.dtId) {
        formik.setFieldValue('dtId', documentType.dtId)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async function () {
      if (recordId && measurements) {
        const res = await getData(recordId)
        const res3 = await getDataGrid(recordId)

        formik.setValues({
          ...res.record,
          items: res3
        })
      }
    })()
  }, [recordId, measurements])

  async function previewBtnClicked() {
    const data = { printStatus: 2, recordId: formik.values.recordId }

    await postRequest({
      extension: IVReplenishementRepository.MaterialReplenishment.print,
      record: JSON.stringify(data)
    })

    invalidate()
  }

  return (
    <FormShell
      resourceId={ResourceIds.MaterialReplenishment}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      previewReport={editMode}
      previewBtnClicked={previewBtnClicked}
      actions={actions}
      functionId={SystemFunction.MaterialRequest}
      disabledSubmit={isClosed || isCancelled}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2} direction='column'>
                <Grid item>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_dgId=${SystemFunction.MaterialRequest}&_startAt=${0}&_pageSize=${50}`}
                    filter={!editMode ? item => item.activeStatus === 1 : undefined}
                    name='dtId'
                    label={labels.documentType}
                    readOnly={isClosed || isCancelled}
                    valueField='recordId'
                    displayField='name'
                    values={formik?.values}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId || '')
                      changeDT(newValue)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik?.values?.reference}
                    readOnly={isClosed || isCancelled || editMode}
                    maxAccess={!editMode && maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item>
                  <CustomDatePicker
                    name='date'
                    label={labels.date}
                    value={formik?.values?.date}
                    required
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('date', '')}
                    readOnly={isClosed || isCancelled}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item>
                  <ResourceComboBox
                    endpointId={companyStructureRepository.DepartmentFilters.qry}
                    parameters={`_filter=&_size=1000&_startAt=0&_type=0&_activeStatus=0&_sortBy=recordId`}
                    name='departmentId'
                    readOnly={isClosed || isCancelled}
                    label={labels.department}
                    values={formik.values}
                    displayField='name'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('departmentId', newValue?.recordId)
                    }}
                    error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2} direction='column'>
                <Grid item>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='siteId'
                    readOnly={isClosed || isCancelled}
                    refresh={editMode}
                    label={labels.site}
                    values={formik.values}
                    displayField='name'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('siteId', newValue?.recordId)
                    }}
                    error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                  />
                </Grid>
                <Grid item>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='fromSiteId'
                    readOnly={isClosed || isCancelled || formik?.values?.items?.some(transfer => transfer.sku)}
                    label={labels.fromSite}
                    values={formik.values}
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    displayFieldWidth={1}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('fromSiteId', newValue?.recordId || '')
                    }}
                    error={formik.touched.fromSiteId && Boolean(formik.errors.fromSiteId)}
                  />
                </Grid>
                <Grid item>
                  <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik?.values?.notes}
                    readOnly={isClosed || isCancelled}
                    maxLength='200'
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <DataGrid
            onChange={value => {
              const data = value?.map(item => {
                return {
                  ...item,
                  details: false,
                  qtyInBase: 0
                }
              })

              formik?.setFieldValue('items', data)
            }}
            onSelectionChange={(row, update, field) => {
              if (field == 'muRef') getFilteredMU(row?.itemId)
            }}
            name='items'
            maxAccess={maxAccess}
            value={formik?.values?.items}
            error={formik?.errors?.items}
            columns={columns}
            allowDelete={!isClosed || !isCancelled}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
