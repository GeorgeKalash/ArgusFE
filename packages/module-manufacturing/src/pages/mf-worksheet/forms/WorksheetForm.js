import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ImageUpload from '@argus/shared-ui/src/components/Inputs/ImageUpload'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import CustomDateTimePicker from '@argus/shared-ui/src/components/Inputs/CustomDateTimePicker'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import DamageForm from '@argus/shared-ui/src/components/Shared/Forms/DamageForm'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'

export default function WorksheetForm({ labels, maxAccess, setStore, store, joInvalidate }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { stack } = useWindow()
  const functionId = SystemFunction.Worksheet
  const resourceId = ResourceIds.Worksheet
  const editMode = !!recordId

  const { documentType, access, changeDT } = useDocumentType({
    functionId: functionId,
    access: maxAccess,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Worksheet.page
  })

  const { formik } = useForm({
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId: null,
      seqNo: 1,
      dtId: null,
      reference: '',
      designRef: '',
      status: 1,
      releaseStatus: null,
      date: new Date(),
      jobId: null,
      workCenterId: null,
      laborId: null,
      siteId: null,
      notes: '',
      qty: 0.0,
      routingId: null,
      wipQty: 0.0,
      rmQty: 0.0,
      wipPcs: 0.0,
      duration: 0.0,
      jobQty: 0.0,
      jobPcs: 0.0,
      startTime: null,
      endTime: null,
      wgtBefore: null,
      wgtAfter: null,
      eopQty: 0,
      damagedPcs: null,
      shiftId: null,
      category: '',
      pgItemName: '',
      itemCategoryName: ''
    },
    maxAccess: access,
    validationSchema: yup.object({
      jobId: yup.number().required(),
      workCenterId: yup.number().required(),
      laborId: yup.number().required(),
      wipQty: yup.number().required(),
      siteId: yup.number().required(),
      qty: yup.number().required(),
      jobQty: yup.number().required()
    }),
    onSubmit: async obj => {
      const data = {
        ...obj,
        date: formatDateToApi(obj?.date),
        startTime: formatDateToApi(new Date()),
        endTime: formatDateToApi(new Date())
      }

      await postRequest({
        extension: ManufacturingRepository.Worksheet.set,
        record: JSON.stringify({ ...data })
      }).then(async res => {
        if (!obj.recordId) {
          setStore(prevStore => ({
            ...prevStore,
            recordId: res?.recordId,
            isPosted: res?.status == 3,
            values: data
          }))
        }
        getData(res.recordId)
        toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
        joInvalidate ? joInvalidate() : invalidate()
      })
    }
  })

  const getData = async recordId => {
    await getRequest({
      extension: ManufacturingRepository.Worksheet.get,
      parameters: `_recordId=${recordId || formik.values.recordId}`
    }).then(async res => {
      const res2 = await getRequest({
        extension: ManufacturingRepository.WorkCenter.get,
        parameters: `_recordId=${res?.record?.workCenterId}`
      })

      formik.setValues({
        ...res?.record,
        date: formatDateFromApi(res?.record?.date),
        startTime: formatDateFromApi(res?.record?.startTime),
        endTime: formatDateFromApi(res?.record?.endTime),
        siteId: res2?.record?.siteId
      })
      setStore(prevStore => ({
        ...prevStore,
        isPosted: res?.record?.status == 3,
        values: {
          ...res?.record,
          siteId: res2?.record?.siteId,
          date: formatDateFromApi(res?.record?.date)
        }
      }))
    })
  }

  useEffect(() => {
    ;(async function () {
      recordId && (await getData(recordId))
    })()
  }, [])

  const isPosted = formik.values.status === 3

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId,
        recordId: formik.values.recordId
      }
    })
  }

  const onPost = async () => {
    const data = {
      ...formik.values,
      date: formatDateToApi(formik?.values?.date) || null
    }
    await postRequest({
      extension: ManufacturingRepository.Worksheet.post,
      record: JSON.stringify(data)
    }).then(async () => {
      await getData()
      joInvalidate ? joInvalidate() : invalidate()
      toast.success(platformLabels.Posted)
    })
  }

  const onDamage = () => {
    stack({
      Component: DamageForm,
      props: {
        jobId: formik?.values?.jobId
      },
      width: 1000,
      height: 700,
      title: labels.Damage
    })
  }

  const actions = [
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode || isPosted
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    },
    {
      key: 'Locked',
      condition: isPosted,
      disabled: true
    },
    {
      key: 'IV',
      condition: true,
      onClick: 'onInventoryTransaction',
      disabled: !editMode || !isPosted
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      datasetId: ResourceIds.GLWorksheet,
      disabled: !editMode
    },
    {
      key: 'Damage',
      condition: true,
      onClick: onDamage,
      disabled: !editMode
    }
  ]

  const fillDocumentTypeFields = async dtId => {
    if (dtId) {
      const res = await getRequest({
        extension: ManufacturingRepository.DocumentTypeDefault.get,
        parameters: `_dtId=${dtId}`
      })

      const res2 =
        res.record &&
        (await getRequest({
          extension: ManufacturingRepository.WorkCenter.get,
          parameters: `_recordId=${res?.record?.workCenterId}`
        }))
      formik.setFieldValue('dtId', dtId || null)
      formik.setFieldValue('siteName', res2?.record?.siteName || '')
      formik.setFieldValue('siteId', res2?.record?.siteId || null)
      formik.setFieldValue('workCenterId', res?.record?.workCenterId || null)
    } else {
      formik.setFieldValue('dtId', null)
      formik.setFieldValue('siteId', null)
      formik.setFieldValue('siteName', '')
      formik.setFieldValue('laborId', null)
      formik.setFieldValue('workCenterId', null)
    }
  }

  useEffect(() => {
    ;(async function () {
      if (!recordId && documentType?.dtId) {
        fillDocumentTypeFields(documentType?.dtId)
      }
    })()
  }, [documentType?.dtId])

  return (
    <FormShell
      resourceId={resourceId}
      functionId={functionId}
      form={formik}
      maxAccess={access}
      editMode={editMode}
      actions={actions}
      previewReport={true}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.Worksheet.pack}
                    reducer={response => response?.record?.documentTypes}
                    name='dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    maxAccess={access}
                    onChange={async (event, newValue) => {
                      await fillDocumentTypeFields(newValue?.recordId)

                      formik.setFieldValue('dtId', newValue?.recordId || null)

                      changeDT(newValue)
                    }}
                    readOnly={editMode}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='reference'
                        label={labels.reference}
                        value={formik.values.reference}
                        readOnly={editMode}
                        maxLength='15'
                        maxAccess={!editMode && access}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('reference', '')}
                        error={formik.touched.reference && Boolean(formik.errors.reference)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <ResourceLookup
                        endpointId={ManufacturingRepository.MFJobOrder.snapshot2}
                        parameters={{ _workCenterId: formik.values.workCenterId }}
                        name='jobRef'
                        label={labels.jobRef}
                        valueField='jobRef'
                        displayField='jobRef'
                        valueShow='jobRef'
                        columnsInDropDown={[
                          { key: 'jobRef', value: 'Job Order' },
                          { key: 'designRef', value: 'Design Ref' }
                        ]}
                        readOnly={!formik?.values?.workCenterId || isPosted || editMode}
                        required
                        secondDisplayField={false}
                        form={formik}
                        onChange={async (event, newValue) => {
                          if (!newValue?.jobId) return

                          const res = await getRequest({
                            extension: ManufacturingRepository.MFJobOrder.get,
                            parameters: `_recordId=${newValue?.jobId}`
                          })
                          formik.setValues({
                            ...formik.values,
                            jobId: newValue?.jobId || null,
                            jobRef: newValue?.jobRef || '',
                            routingId: res?.record?.routingId || null,
                            designRef: res?.record?.designRef || '',
                            pgItemName: res?.record?.itemName || '',
                            pgItemId: res?.record?.itemId || null,
                            category: res?.record?.categoryName || '',
                            jobQty: newValue?.qty || 0,
                            jobPcs: newValue?.pcs || 0,
                            wipQty: newValue?.qty || 0,
                            wipPcs: newValue?.pcs || 0,
                            seqNo: res?.record?.routingSeqNo || 1,
                            laborId: null,
                            laborRef: '',
                            laborName: ''
                          })

                          if (res?.record?.itemId) {
                            const res2 = await getRequest({
                              extension: InventoryRepository.Item.get,
                              parameters: `_recordId=${res?.record?.itemId}`
                            })
                            formik.setFieldValue('itemCategoryName', res2?.record?.categoryName || null)
                          }
                        }}
                        errorCheck={'jobId'}
                        maxAccess={access}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={ManufacturingRepository.Worksheet.pack}
                        reducer={response => response?.record?.workCenters}
                        name='workCenterId'
                        label={labels.workCenter}
                        readOnly
                        valueField='recordId'
                        displayField={['reference', 'name']}
                        values={formik.values}
                        required
                        maxAccess={access}
                        error={formik.touched.workCenterId && formik.errors.workCenterId}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={formik.values.workCenterId && ManufacturingRepository.Labor.qry2}
                        parameters={`_workCenterId=${formik.values.workCenterId}`}
                        name='laborId'
                        label={labels.labor}
                        required
                        maxAccess={access}
                        readOnly={!formik.values.workCenterId || isPosted}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ]}
                        valueField='recordId'
                        displayField={['reference', 'name']}
                        values={formik.values}
                        onChange={(event, newValue) => {
                          formik.setFieldValue('laborId', newValue?.recordId || null)
                        }}
                        error={formik.touched.laborId && Boolean(formik.errors.laborId)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomNumberField
                        name='wipQty'
                        required
                        readOnly={isPosted || editMode}
                        label={labels.qty}
                        value={formik?.values?.wipQty}
                        maxAccess={access}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('wipQty', 0)}
                        error={formik.touched.wipQty && Boolean(formik.errors.wipQty)}
                        decimalScale={3}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomNumberField
                        name='wipPcs'
                        readOnly={isPosted || editMode}
                        label={labels.pcs}
                        value={formik?.values?.wipPcs}
                        maxAccess={access}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('wipPcs', 0)}
                        error={formik.touched.wipPcs && Boolean(formik.errors.wipPcs)}
                        decimalScale={3}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomNumberField
                        name='rmQty'
                        readOnly
                        label={labels.rmQty}
                        value={formik?.values?.rmQty}
                        maxAccess={access}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomNumberField
                        name='damagedPcs'
                        readOnly
                        label={labels.damagedPcs}
                        value={formik?.values?.damagedPcs}
                        maxAccess={access}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomNumberField
                        name='eopQty'
                        readOnly
                        label={labels.eopQty}
                        value={formik?.values?.eopQty}
                        maxAccess={access}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomNumberField
                        name='endPcs'
                        readOnly
                        label={labels.endPcs}
                        value={(formik?.values?.wipPcs || 0) - (formik?.values?.damagedPcs || 0)}
                        maxAccess={access}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextArea
                        name='notes'
                        readOnly={isPosted}
                        label={labels.notes}
                        value={formik.values.notes}
                        rows={3}
                        maxLength='100'
                        editMode={editMode}
                        maxAccess={access}
                        onChange={e => formik.setFieldValue('notes', e.target.value)}
                        onClear={() => formik.setFieldValue('notes', '')}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='pgItemName'
                        label={labels.pgItem}
                        value={formik.values.pgItemName}
                        readOnly
                        maxAccess={access}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='itemCategoryName'
                        label={labels.itemCategory}
                        value={formik.values.itemCategoryName}
                        readOnly
                        maxAccess={access}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='category'
                        label={labels.jobCategory}
                        value={formik.values.category}
                        readOnly
                        maxAccess={access}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={ManufacturingRepository.Worksheet.pack}
                        reducer={response => response?.record?.sites}
                        name='siteId'
                        label={labels.site}
                        required
                        readOnly
                        values={formik.values}
                        displayField='name'
                        maxAccess={access}
                        error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='designRef'
                        label={labels.designRef}
                        value={formik.values.designRef}
                        readOnly
                        maxAccess={access}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomNumberField
                        name='jobQty'
                        label={labels.jobQty}
                        value={formik.values.jobQty}
                        required
                        readOnly
                        maxAccess={access}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomNumberField
                        name='jobPcs'
                        label={labels.jobPcs}
                        value={formik.values.jobPcs}
                        readOnly
                        maxAccess={access}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <CustomNumberField
                        name='wgtBefore'
                        readOnly={isPosted}
                        label={labels.wgtBefore}
                        value={formik?.values?.wgtBefore}
                        maxAccess={access}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('wgtBefore', '')}
                        error={formik.touched.wgtBefore && Boolean(formik.errors.wgtBefore)}
                        decimalScale={3}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomNumberField
                        name='wgtAfter'
                        readOnly={isPosted}
                        label={labels.wgtAfter}
                        value={formik?.values?.wgtAfter}
                        maxAccess={access}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('wgtAfter', '')}
                        error={formik.touched.wgtAfter && Boolean(formik.errors.wgtAfter)}
                        decimalScale={3}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ImageUpload
                    resourceId={ResourceIds.MFJobOrders}
                    seqNo={0}
                    recordId={formik.values.jobId}
                    customWidth={320}
                    customHeight={190}
                    isAbsolutePath={true}
                    disabled={true}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    readOnly
                    label={labels.date}
                    value={formik.values.date}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDateTimePicker
                    name='startTime'
                    readOnly
                    label={labels.startTime}
                    value={formik.values?.startTime}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDateTimePicker
                    name='endTime'
                    readOnly
                    label={labels.endTime}
                    value={formik.values?.endTime}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.Worksheet.pack}
                    reducer={response => response?.record?.shifts}
                    name='shiftId'
                    label={labels.shift}
                    maxAccess={access}
                    readOnly={isPosted}
                    valueField='recordId'
                    displayField={'name'}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('shiftId', newValue?.recordId || null)
                    }}
                    error={formik.touched.shiftId && Boolean(formik.errors.shiftId)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
