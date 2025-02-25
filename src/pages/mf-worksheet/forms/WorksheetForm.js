import { Grid } from '@mui/material'
import { useContext, useEffect, useRef } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import ImageUpload from 'src/components/Inputs/ImageUpload'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomDateTimePicker from 'src/components/Inputs/CustomDateTimePicker'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import Table from 'src/components/Shared/Table'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { SystemFunction } from 'src/resources/SystemFunction'
import DamageForm from 'src/pages/damages/forms/DamageForm'
import { useWindow } from 'src/windows'
import WorkFlow from 'src/components/Shared/WorkFlow'
import WorksheetWindow from '../window/WorksheetWindow'

export default function WorksheetForm({ labels, maxAccess, setStore, store, window }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { stack } = useWindow()
  const imageUploadRef = useRef(null)
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
    initialValues: {
      recordId: null,
      seqNo: 1,
      dtId: documentType?.dtId,
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
      joQty: 0.0,
      joPcs: 0.0,
      startTime: null,
      endTime: null,
      wgtBefore: null,
      wgtAfter: null,
      eopQty: 0,
      damagedPcs: null
    },
    maxAccess: access,
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      jobId: yup.number().required(),
      workCenterId: yup.number().required(),
      laborId: yup.number().required(),
      wipQty: yup.number().required(),
      siteId: yup.number().required(),
      qty: yup.number().required(),
      eopQty: yup.number().required(),
      joQty: yup.number().required()
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
        if (imageUploadRef.current) {
          imageUploadRef.current.value = parseInt(res.recordId)

          await imageUploadRef.current.submit()
        }
        if (!obj.recordId) {
          setStore(prevStore => ({
            ...prevStore,
            recordId: res?.recordId,
            isPosted: res?.status == 3,
            values: data
          }))

          formik.setFieldValue('recordId', res.recordId)
          getData(res.recordId)
        }

        const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
        toast.success(actionMessage)
        invalidate()
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
        ...res.record,
        date: formatDateFromApi(res.record.date),
        startTime: formatDateFromApi(res.record.startTime),
        endTime: formatDateFromApi(res.record.endTime),
        siteId: res2?.record?.siteId
      })
      setStore(prevStore => ({
        ...prevStore,
        values: {
          ...res.record,
          siteId: res2?.record?.siteId,
          date: formatDateFromApi(res.record.date)
        }
      }))
    })
  }

  useEffect(() => {
    ;(async function () {
      recordId && (await getData(recordId))
    })()
  }, [])

  const {
    query: { data }
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.Worksheet.summary,
    datasetId: resourceId,
    enabled: Boolean(recordId)
  })

  async function fetchGridData() {
    return await getRequest({
      extension: ManufacturingRepository.Worksheet.summary,
      parameters: `_worksheetId=${recordId}`
    })
  }

  const isPosted = formik.values.status === 3
  const totalIssued = data ? data.list.reduce((op, item) => op + item?.issued_qty, 0) : 0
  const totalLoss = data ? data.list.reduce((op, item) => op + item?.lost_qty, 0) : 0
  const totalReturned = data ? data.list.reduce((op, item) => op + item?.returned_qty, 0) : 0
  const otalConsumed = data ? data.list.reduce((op, item) => op + item?.consumed_qty, 0) : 0

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId,
        recordId: formik.values.recordId
      },
      width: 950,
      title: labels.workflow
    })
  }

  const onPost = async () => {
    const data = {
      ...formik.values,
      date: formatDateToApi(formik.values.date)
    }
    await postRequest({
      extension: ManufacturingRepository.Worksheet.post,
      record: JSON.stringify(data)
    }).then(async () => {
      await getData()
      toast.success(platformLabels.Posted)
      invalidate()
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

  const onRefresh = () => {
    window.close()
    stack({
      Component: WorksheetWindow,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 1200,
      height: 780,
      title: labels.Worksheet
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
      disabled: !editMode || isPosted
    },
    {
      key: 'Damage',
      condition: true,
      onClick: onDamage,
      disabled: !editMode || isPosted
    },
    {
      key: 'Refresh',
      condition: true,
      onClick: onRefresh,
      disabled: !editMode || isPosted
    }
  ]

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
          <Grid container spacing={4}>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
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
                      if (newValue) {
                        const res = await getRequest({
                          extension: ManufacturingRepository.DocumentTypeDefault.get,
                          parameters: `_dtId=${newValue?.recordId}`
                        })

                        const res2 =
                          res.record &&
                          (await getRequest({
                            extension: ManufacturingRepository.WorkCenter.get,
                            parameters: `_recordId=${res?.record?.workCenterId}`
                          }))
                        formik.setFieldValue('dtId', newValue?.recordId || null)
                        formik.setFieldValue('siteId', res2?.record?.siteId || null)
                        formik.setFieldValue('siteName', res2?.record?.siteName || '')
                        formik.setFieldValue('workCenterId', res?.record?.workCenterId || null)
                        formik.setFieldValue('workCenterRef', res?.record?.workCenterRef || '')
                        formik.setFieldValue('workCenterName', res?.record?.workCenterName || '')
                      } else {
                        formik.setFieldValue('dtId', null)
                        formik.setFieldValue('siteId', null)
                        formik.setFieldValue('siteName', '')
                        formik.setFieldValue('workCenterId', null)
                        formik.setFieldValue('workCenterRef', '')
                        formik.setFieldValue('workCenterName', '')
                      }

                      changeDT(newValue)
                    }}
                    readOnly={editMode}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
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
                    valueField='reference'
                    displayField='name'
                    valueShow='jobRef'
                    columnsInDropDown={[
                      { key: 'reference', value: 'Job Order' },
                      { key: 'designRef', value: 'Design Ref' }
                    ]}
                    readOnly={!formik?.values?.workCenterId || isPosted || editMode}
                    required
                    secondDisplayField={false}
                    form={formik}
                    onChange={(event, newValue) => {
                      formik.setValues({
                        ...formik.values,
                        jobId: newValue?.recordId || null,
                        jobRef: newValue?.reference || '',
                        jobName: newValue?.name || '',
                        routingId: newValue?.routingId || null,
                        designRef: newValue?.designRef || '',
                        itemName: newValue?.itemName || '',
                        joQty: newValue?.qty || 0,
                        joPcs: newValue?.pcs || 0,
                        wipQty: newValue?.qty || 0,
                        wipPcs: newValue?.pcs || 0,
                        seqNo: newValue?.routingSeqNo || 1,
                        laborId: null,
                        laborRef: '',
                        laborName: ''
                      })
                    }}
                    errorCheck={'jobId'}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.WorkCenter.qry}
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
                  <ResourceLookup
                    endpointId={ManufacturingRepository.Labor.snapshot}
                    parameters={{ _workCenterId: formik.values.workCenterId }}
                    name='laborId'
                    label={labels.labor}
                    valueField='reference'
                    displayField='name'
                    valueShow='laborRef'
                    required
                    readOnly={!formik.values.workCenterId || isPosted}
                    secondValueShow='laborName'
                    form={formik}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('laborId', newValue?.recordId || null)
                      formik.setFieldValue('laborRef', newValue?.reference || '')
                      formik.setFieldValue('laborName', newValue?.name || '')
                    }}
                    errorCheck={'laborId'}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
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
                <Grid item xs={12}>
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
                <Grid item xs={12}>
                  <CustomNumberField
                    name='damagedPcs'
                    readOnly={isPosted}
                    label={labels.damagedPcs}
                    value={formik?.values?.damagedPcs}
                    maxAccess={access}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('damagedPcs', 0)}
                    error={formik.touched.damagedPcs && Boolean(formik.errors.damagedPcs)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='itemName'
                    label={labels.pgItem}
                    value={formik.values.itemName}
                    readOnly
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
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
                    name='joQty'
                    label={labels.joQty}
                    value={formik.values.joQty}
                    required
                    readOnly
                    maxAccess={access}
                    error={formik.touched.joQty && Boolean(formik.errors.joQty)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='joPcs'
                    label={labels.joPcs}
                    value={formik.values.joPcs}
                    readOnly
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='rmQty'
                    readOnly={isPosted || editMode}
                    label={labels.rmQty}
                    value={formik?.values?.rmQty}
                    maxAccess={access}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('rmQty', '')}
                    error={formik.touched.rmQty && Boolean(formik.errors.rmQty)}
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
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ImageUpload
                    ref={imageUploadRef}
                    resourceId={resourceId}
                    seqNo={0}
                    recordId={recordId}
                    customWidth={320}
                    customHeight={180}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='eopQty'
                    readOnly={isPosted || editMode}
                    required
                    label={labels.eopQty}
                    value={formik?.values?.eopQty}
                    maxAccess={access}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('eopQty', '')}
                    error={formik.touched.eopQty && Boolean(formik.errors.eopQty)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    readOnly={isPosted || editMode}
                    label={labels.date}
                    value={formik.values.date}
                    onChange={formik.setFieldValue}
                    maxAccess={access}
                    onClear={() => formik.setFieldValue('date', '')}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDateTimePicker
                    name='startTime'
                    readOnly={isPosted || editMode}
                    label={labels.startTime}
                    value={formik.values?.startTime}
                    onChange={(name, newValue) => {
                      formik.setFieldValue(startTime, newValue)
                    }}
                    maxAccess={access}
                    error={formik.errors?.startTime && Boolean(formik.errors?.startTime)}
                    onClear={() => formik.setFieldValue(startTime, null)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDateTimePicker
                    name='endTime'
                    readOnly={isPosted || editMode}
                    label={labels.endTime}
                    value={formik.values?.endTime}
                    onChange={(name, newValue) => {
                      formik.setFieldValue(endTime, newValue)
                    }}
                    maxAccess={access}
                    error={formik.errors?.endTime && Boolean(formik.errors?.endTime)}
                    onClear={() => formik.setFieldValue(endTime, null)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            name='operationTable'
            gridData={data}
            maxAccess={access}
            columns={[
              { field: 'operationRef', headerName: labels.operationRef, flex: 1 },
              { field: 'operationName', headerName: labels.operationName, flex: 1 },
              { field: 'issued_qty', headerName: labels.issued, type: 'number', flex: 1 },
              { field: 'returned_qty', headerName: labels.returned, type: 'number', flex: 1 },
              { field: 'lost_qty', headerName: labels.loss, type: 'number', flex: 1 },
              { field: 'consumed_qty', headerName: labels.consumed, type: 'number', flex: 1 }
            ]}
            rowId={['operationId']}
            pagination={false}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={4}>
            <Grid item xs={6}>
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
            <Grid item xs={1}>
              {labels.total}:
            </Grid>
            <Grid item xs={5}>
              <Grid container spacing={4}>
                <Grid item xs={3}>
                  <CustomNumberField name='totalIssued' value={totalIssued} readOnly />
                </Grid>
                <Grid item xs={3}>
                  <CustomNumberField name='totalLoss' value={totalLoss} readOnly />
                </Grid>
                <Grid item xs={3}>
                  <CustomNumberField name='totalReturned' value={totalReturned} readOnly />
                </Grid>
                <Grid item xs={3}>
                  <CustomNumberField name='totalConsumed' value={otalConsumed} readOnly />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
