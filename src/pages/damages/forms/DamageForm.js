import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import Table from 'src/components/Shared/Table'
import CustomButton from 'src/components/Inputs/CustomButton'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import useResourceParams from 'src/hooks/useResourceParams'
import { useWindow } from 'src/windows'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { LockedScreensContext } from 'src/providers/LockedScreensContext'

export default function DamageForm({ recordId, lockRecord }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { addLockedScreen } = useContext(LockedScreensContext)
  const { stack } = useWindow()

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Damage.page
  })

  const { labels, access } = useResourceParams({
    endpointId: ManufacturingRepository.Damage.page,
    datasetId: ResourceIds.Damages
  })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.Damage,
    access: access,
    enabled: !recordId,
    objectName: 'header'
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'header.dtId', value: documentType?.dtId },
    initialValues: {
      recordId: recordId || null,
      header: {
        recordId: recordId || null,
        dtId: null,
        reference: '',
        date: new Date(),
        plantId: null,
        laborId: null,
        notes: '',
        status: 1,
        jobId: null,
        seqNo: 0,
        workCenterId: null,
        maxPcs: 50,
        jobQty: 0,
        jobPcs: 0,
        damageRate: 0,
        damagedQty: 0,
        damagedPcs: 0,
        netJobQty: 0,
        netJobPcs: 0,
        metalQty: 0,
        nonMetalQty: 0,
        generatedJobRef: '',
        routingId: null,
        routingName: ''
      },
      items: []
    },
    validateOnChange: true,
    validationSchema: yup.object({
      header: yup.object({
        plantId: yup.string().required(),
        jobId: yup.string().required(),
        date: yup.string().required(),
        laborId: yup.number().required(),
        damageRate: yup.number().required(),
        jobQty: yup.number().required(),
        jobPcs: yup.number().required(),
        netJobQty: yup.number().required(),
        netJobPcs: yup.number().required(),
        metalQty: yup.number().required().min(0),
        nonMetalQty: yup.number().required().min(0),
        routingId: yup
          .number()
          .nullable()
          .when('genJobFromDamage', {
            is: true,
            then: () => yup.number().required(),
            otherwise: () => yup.number().nullable()
          }),
        damagedPcs: yup.lazy((_, { parent }) =>
          yup
            .number()
            .min(1)
            .max(parent.maxPcs, ({ max }) => `Must be less than or equal to ${max}`)
            .nullable(true)
        ),
        damagedQty: yup
          .number()
          .required()
          .test('max-jobQty', 'Qty cannot be greater than Job Qty', function (value) {
            if (value == null) return true

            return value <= this.parent.jobQty
          })
      })
    }),
    onSubmit: async obj => {
      const payload = {
        header: {
          ...formik.values.header,
          date: formatDateToApi(obj.header.date),
          damageRate: obj.header.damageRate || 0,
          qty: obj.header.qty || 0
        },
        items:
          formik?.values?.items?.map(({ id, ...rest }) => ({
            seqNo: id,
            ...rest
          })) || []
      }

      const res = await postRequest({
        extension: ManufacturingRepository.Damage.set2,
        record: JSON.stringify(payload)
      })

      await refetchForm(res.recordId)
      toast.success(editMode ? platformLabels.Edited : platformLabels.Added)
      invalidate()
    }
  })

  async function refetchForm(damageId) {
    await getRequest({
      extension: ManufacturingRepository.Damage.get2,
      parameters: `_recordId=${damageId}`
    }).then(async res => {
      const genJobFromDamage = await getDTD(res?.record?.header?.dtId)

      formik.setValues({
        recordId: res?.record?.header?.recordId || null,
        header: {
          ...res?.record?.header,
          date: formatDateFromApi(res?.record?.header?.date),
          maxPcs: res?.record?.header?.jobPcs,
          workCenterName: res?.record?.header?.wcName,
          workCenterRef: res?.record?.header?.wcRef,
          genJobFromDamage
        },
        items: res?.record?.items || []
      })

      !formik.values.recordId &&
        lockRecord({
          recordId: res?.record?.header?.recordId,
          reference: res?.record?.header?.reference,
          resourceId: ResourceIds.Damages,
          onSuccess: () => {
            addLockedScreen({
              resourceId: ResourceIds.Damages,
              recordId: res?.record?.header?.recordId,
              reference: res?.record?.header?.reference
            })
          }
        })
    })
  }

  const editMode = !!formik.values.header.recordId
  const isPosted = formik.values.header.status === 3

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.Damage.post,
      record: JSON.stringify(formik.values.header)
    })

    toast.success(platformLabels.Posted)
    invalidate()

    await refetchForm(formik.values.recordId)
  }

  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.Damage,
        recordId: formik.values.recordId
      }
    })
  }

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      disabled: !editMode || isPosted
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || isPosted
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    }
  ]

  useEffect(() => {
    if (recordId) {
      refetchForm(recordId)
    }
  }, [])

  const columns = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.itemName,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1
    },
    {
      field: 'damageQty',
      headerName: labels.damageQty,
      flex: 1
    }
  ]

  const onPreview = async () => {
    if (!formik.values.header.jobId && !formik.values.header.damageRate) {
      return
    }

    const items = await getRequest({
      extension: ManufacturingRepository.Damage.preview,
      parameters: `_jobId=${formik.values.header.jobId || 0}&_damagedQty=${
        formik.values.header.damagedQty || 0
      }&_damagedPcs=${formik.values.header.damagedPcs || 0}&_metalQty=${parseFloat(
        formik.values.header.metalQty || 0
      ).toFixed(2)}&_nonMetalQty=${parseFloat(formik.values.header.nonMetalQty || 0).toFixed(2)}`
    })

    formik.setFieldValue('items', items?.list || [])
  }

  const { jobQty = 0, damagedQty = 0, jobPcs = 0, damagedPcs = 0 } = formik.values.header

  const netQty = jobQty - damagedQty
  const netPcs = jobPcs - damagedPcs

  async function getMetalAndNonMetalQty(jobId) {
    if (!jobId) return

    const res = await getRequest({
      extension: ManufacturingRepository.JobMaterial.qry,
      parameters: `_jobId=${jobId}&_seqNo=0`
    })

    const list = res?.list || []

    const metalQty = list
      .filter(i => !!i.isMetal)
      .reduce((sum, i) => {
        const value = Number(i.qty) || 0

        return Math.round((sum + value) * 100) / 100
      }, 0)

    const nonMetalQty = list
      .filter(i => !i.isMetal)
      .reduce((sum, i) => {
        const value = Number(i.qty) || 0

        return Math.round((sum + value) * 100) / 100
      }, 0)

    return { metalQty, nonMetalQty }
  }

  const hasItems = formik?.values?.items?.length > 0

  async function getDTD(dtId) {
    if (dtId) {
      const res = await getRequest({
        extension: ManufacturingRepository.DocumentTypeDefault.get,
        parameters: `_dtId=${dtId}`
      })

      formik.setFieldValue('header.genJobFromDamage', res?.record?.genJobFromDamage)

      return res?.record?.genJobFromDamage || false
    } else {
      formik.setFieldValue('header.genJobFromDamage', false)
    }
  }

  const getSeqNo = async routingId => {
    if (!routingId) return

    const res = await getRequest({
      extension: ManufacturingRepository.RoutingSequence.qry,
      parameters: `_routingId=${routingId}`
    })

    return res?.list?.[0]?.seqNo || null
  }

  return (
    <FormShell
      resourceId={ResourceIds.Damages}
      functionId={SystemFunction.Damage}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      isPosted={isPosted}
      actions={actions}
      editMode={editMode}
      disabledSubmit={(formik.values.header.damagedQty != 0 && !hasItems) || isPosted}
      disabledSavedClear={(formik.values.header.damagedQty != 0 && !hasItems) || isPosted}
      isParentWindow={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2} paddingTop={1}>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.Damage}`}
                    name='header.dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={formik.values.header.jobId || editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    displayFieldWidth={2}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={async (event, newValue) => {
                      await changeDT(newValue)
                      await getDTD(newValue?.recordId)

                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.dtId && Boolean(formik?.errors?.header?.dtId)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik?.values?.header?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik?.touched?.header?.reference && Boolean(formik?.errors?.header?.reference)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomDatePicker
                    name='header.date'
                    required
                    label={labels.date}
                    value={formik?.values?.header?.date}
                    onChange={formik.setFieldValue}
                    readOnly={editMode}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('header.date', null)}
                    error={formik?.touched?.header?.date && Boolean(formik?.errors?.header?.date)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Plant.qry}
                    name='header.plantId'
                    required
                    readOnly={isPosted}
                    label={labels.plant}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    displayFieldWidth={1.5}
                    values={formik.values.header}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.plantId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.plantId && Boolean(formik?.errors?.header?.plantId)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <CustomButton
                        onClick={onPreview}
                        image={'preview.png'}
                        tooltipText={platformLabels.Preview}
                        disabled={formik.values.header.damagedQty == 0 || isPosted}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <CustomNumberField
                        name='header.routingSeqNo'
                        label={labels.routingSeqNo}
                        value={formik?.values?.header?.routingSeqNo}
                        maxAccess={maxAccess}
                        readOnly
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ManufacturingRepository.MFJobOrder.snapshot}
                    filter={{ status: 4 }}
                    valueField='reference'
                    displayField='reference'
                    secondDisplayField={false}
                    name='header.jobId'
                    label={labels.jobOrder}
                    form={formik}
                    formObject={formik.values.header}
                    required
                    readOnly={hasItems || editMode}
                    displayFieldWidth={2}
                    valueShow='jobRef'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'itemName', value: 'Item Name' },
                      { key: 'description', value: 'Description' }
                    ]}
                    onChange={async (_, newValue) => {
                      const res = await getMetalAndNonMetalQty(newValue?.recordId)

                      formik.setValues({
                        header: {
                          ...formik.values.header,
                          jobId: newValue?.recordId || null,
                          jobRef: newValue?.reference || '',
                          jobQty: newValue?.qty || 0,
                          jobPcs: newValue?.pcs || 0,
                          sku: newValue?.sku || '',
                          designRef: newValue?.designRef || '',
                          designName: newValue?.designName || '',
                          itemName: newValue?.itemName || '',
                          workCenterName: newValue?.wcName || '',
                          workCenterId: newValue?.workCenterId || null,
                          maxPcs: newValue?.pcs || 0,
                          damageRate: (formik.values.qty / newValue?.qty) * 100 || 0,
                          ...(!formik.values.header.genJobFromDamage
                            ? {
                                routingName: newValue?.routingName || '',
                                routingId: newValue?.routingId || null,
                                routingRef: newValue?.routingRef || '',
                                routingSeqNo: newValue?.routingSeqNo || null
                              }
                            : {}),
                          metalQty: res?.metalQty || 0,
                          nonMetalQty: res?.nonMetalQty || 0
                        }
                      })
                    }}
                    errorCheck={'header.jobId'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={InventoryRepository.Item.snapshot}
                    name='header.itemId'
                    label={labels.sku}
                    valueField='recordId'
                    displayField='name'
                    valueShow='sku'
                    secondValueShow='itemName'
                    formObject={formik.values.header}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ManufacturingRepository.Design.snapshot}
                    name='header.designId'
                    label={labels.designRef}
                    valueField='recordId'
                    displayField='name'
                    valueShow='designRef'
                    secondValueShow='designName'
                    formObject={formik.values.header}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='header.workCenterName'
                    label={labels.workCenter}
                    value={formik?.values?.header?.workCenterName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={ManufacturingRepository.Routing.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='header.routingId'
                    label={labels.routing}
                    formObject={formik.values.header}
                    form={formik}
                    minChars={2}
                    firstFieldWidth={5}
                    firstValue={formik.values.header.routingRef}
                    secondValue={formik.values.header.routingName}
                    errorCheck={'header.routingId'}
                    maxAccess={maxAccess}
                    displayFieldWidth={2}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required={formik.values.header.genJobFromDamage}
                    readOnly={!formik.values.header.genJobFromDamage || isPosted}
                    onChange={async (_, newValue) => {
                      const seqNo = await getSeqNo(newValue?.recordId)

                      formik.setFieldValue('header.routingSeqNo', seqNo || null)
                      formik.setFieldValue('header.routingRef', newValue?.reference || null)
                      formik.setFieldValue('header.routingName', newValue?.name || null)

                      formik.setFieldValue('header.routingId', newValue?.recordId || null)
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.jobQty'
                    label={labels.jobQty}
                    value={formik.values?.header?.jobQty}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.jobQty', 0)}
                    required
                    readOnly
                    maxAccess={maxAccess}
                    error={formik?.touched?.header?.jobQty && Boolean(formik?.errors?.header?.jobQty)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.jobPcs'
                    readOnly
                    label={labels.jobPcs}
                    value={formik.values?.header?.jobPcs}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.jobPcs', 0)}
                    required
                    maxAccess={maxAccess}
                    error={formik?.touched?.header?.jobPcs && Boolean(formik?.errors?.header?.jobPcs)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.damagedQty'
                    label={labels.damagedQty}
                    value={formik.values?.header?.damagedQty}
                    onChange={e => {
                      formik.setFieldValue(
                        'header.damageRate',
                        (e.target.value / formik?.values?.header?.jobQty) * 100 || 0
                      )
                      formik.setFieldValue('header.damagedQty', e.target.value)
                    }}
                    maxLength={11}
                    decimalScale={2}
                    onClear={() => {
                      formik.setFieldValue('header.damageRate', null)
                      formik.setFieldValue('header.damagedQty', null)
                    }}
                    maxAccess={maxAccess}
                    readOnly={hasItems || isPosted}
                    required
                    error={formik?.touched?.header?.damagedQty && Boolean(formik?.errors?.header?.damagedQty)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.damagedPcs'
                    readOnly={hasItems || isPosted}
                    label={labels.damagedPcs}
                    value={formik.values?.header?.damagedPcs}
                    decimalScale={0}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.damagedPcs', 0)}
                    required
                    maxAccess={maxAccess}
                    error={formik?.touched?.header?.damagedPcs && Boolean(formik?.errors?.header?.damagedPcs)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.Labor.qry}
                    parameters={`_startAt=0&_pageSize=200&_params=`}
                    name='header.laborId'
                    label={labels.labor}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    displayFieldWidth={2}
                    required
                    readOnly={isPosted}
                    values={formik.values.header}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.laborId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.laborId && Boolean(formik?.errors?.header?.laborId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <CustomNumberField
                        name='header.metalQty'
                        label={labels.metalQty}
                        value={formik.values?.header?.metalQty}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('header.metalQty', null)}
                        maxAccess={maxAccess}
                        required
                        readOnly
                        error={formik?.touched?.header?.metalQty && Boolean(formik?.errors?.header?.metalQty)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomNumberField
                        name='header.nonMetalQty'
                        label={labels.nonMetalQty}
                        value={formik.values?.header?.nonMetalQty}
                        onChange={formik.handleChange}
                        readOnly
                        onClear={() => formik.setFieldValue('header.nonMetalQty', null)}
                        maxAccess={maxAccess}
                        required
                        error={formik?.touched?.header?.nonMetalQty && Boolean(formik?.errors?.header?.nonMetalQty)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <CustomNumberField
                        name='header.netJobQty'
                        label={labels.netJobQty}
                        value={netQty}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('header.netJobQty', null)}
                        maxAccess={maxAccess}
                        readOnly
                        required
                        error={formik?.touched?.header?.netJobQty && Boolean(formik?.errors?.header?.netJobQty)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CustomNumberField
                        name='header.netJobPcs'
                        label={labels.netJobPcs}
                        value={netPcs}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('header.netJobPcs', null)}
                        maxAccess={maxAccess}
                        readOnly
                        required
                        error={formik?.touched?.header?.netJobPcs && Boolean(formik?.errors?.header?.netJobPcs)}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    name='header.generatedJobRef'
                    label={labels.generatedJobRef}
                    value={formik.values?.header?.generatedJobRef}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    readOnly
                    onClear={() => formik.setFieldValue('header.generatedJobRef', '')}
                    error={formik.touched?.header?.generatedJobRef && Boolean(formik.errors?.header?.generatedJobRef)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.DamageReason.qry}
                    name='header.reasonId'
                    label={labels.damageReason}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isPosted}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.reasonId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.reasonId && formik?.errors?.header?.reasonId}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={ManufacturingRepository.DamageCategory.qry}
                    name='header.categoryId'
                    label={labels.damageCategory}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.categoryId', newValue?.recordId || null)
                    }}
                    error={formik?.touched?.header?.categoryId && formik?.errors?.header?.categoryId}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <Table
            name='damageTable'
            columns={columns}
            gridData={{ list: formik.values.items }}
            rowId={['recordId']}
            pagination={false}
            maxAccess={access}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} paddingTop={1}>
            <Grid item xs={4}>
              <CustomTextArea
                name='header.notes'
                label={labels.remarks}
                value={formik.values.header.notes}
                rows={4}
                editMode={editMode}
                readOnly={isPosted}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('header.notes', e.target.value)}
                onClear={() => formik.setFieldValue('header.notes', '')}
                error={formik?.touched?.header?.notes && Boolean(formik.errors?.header?.notes)}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
