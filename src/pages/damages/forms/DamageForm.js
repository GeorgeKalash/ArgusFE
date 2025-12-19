import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
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

export default function DamageForm({ recordId, jobId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels, access, invalidate } = useResourceQuery({
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
        pcs: yup.lazy((_, { parent }) =>
          yup
            .number()
            .min(1)
            .max(parent.maxPcs, ({ max }) => `Must be less than or equal to ${max}`)
            .nullable(true)
        ),
        qty: yup
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
      postRequest({
        extension: ManufacturingRepository.Damage.set2,
        record: JSON.stringify(payload)
      }).then(async res => {
        toast.success(editMode ? platformLabels.Edited : platformLabels.Added)
        await refetchForm(res.recordId)
        invalidate()
      })
    }
  })

  async function refetchForm(damageId) {
    await getRequest({
      extension: ManufacturingRepository.Damage.get2,
      parameters: `_recordId=${damageId}`
    }).then(async res => {
      await refetchFormJob(res?.record?.header?.jobId, res.record)
    })
  }

  async function refetchFormJob(jobId, res) {
    await getRequest({
      extension: ManufacturingRepository.MFJobOrder.get,
      parameters: `_recordId=${jobId}`
    }).then(jobRes => {
      formik.setValues({
        recordId: res?.header.recordId || null,
        header: {
          ...res?.header,
          date: formatDateFromApi(res?.header.date),
          sku: jobRes?.record?.sku,
          itemName: jobRes?.record?.itemName,
          designName: jobRes?.record?.designName,
          designRef: jobRes?.record?.designRef,
          jobRef: jobRes?.record?.reference,
          jobId: jobRes?.record?.recordId,
          workCenterName: jobRes?.record?.wcName,
          workCenterRef: jobRes?.record?.wcRef,
          workCenterId: jobRes?.record?.workCenterId,
          maxPcs: jobRes?.record?.pcs
        },
        items: res?.items || []
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
    }
  ]

  useEffect(() => {
    if (recordId) {
      refetchForm(recordId)
    } else if (jobId) {
      refetchFormJob(jobId)
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
      extension: ManufacturingRepository.DamageReturnRawMaterial.preview,
      parameters: `_jobId=${formik.values.header.jobId || 0}&_rate=${formik.values.header.damageRate || 0}`
    })

    formik.setFieldValue('items', items?.list || [])
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
      disabledSubmit={isPosted}
      disabledSavedClear={isPosted}
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
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    displayFieldWidth={2}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      changeDT(newValue)

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
                    values={formik.values.header}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('header.plantId', newValue?.recordId)
                    }}
                    error={formik?.touched?.header?.plantId && Boolean(formik?.errors?.header?.plantId)}
                  />
                </Grid>

                <Grid item xs={4}>
                  <CustomButton
                    onClick={onPreview}
                    image={'preview.png'}
                    tooltipText={platformLabels.Preview}
                    disabled={isPosted}
                  />
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
                    readOnly={editMode}
                    displayFieldWidth={2}
                    valueShow='jobRef'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'itemName', value: 'Item Name' },
                      { key: 'description', value: 'Description' }
                    ]}
                    onChange={(_, newValue) => {
                      formik.setValues({
                        header: {
                          ...formik.values.header,
                          jobId: newValue?.recordId || null,
                          jobRef: newValue?.reference || '',
                          jobQty: newValue?.qty || 0,
                          sku: newValue?.sku || '',
                          designRef: newValue?.designRef || '',
                          designName: newValue?.designName || '',
                          itemName: newValue?.itemName || '',
                          workCenterName: newValue?.wcName || '',
                          workCenterId: newValue?.workCenterId || null,
                          plantId: newValue?.plantId || null,
                          maxPcs: newValue?.pcs || 0,
                          damageRate: (formik.values.qty / newValue?.qty) * 100 || 0,
                          routingName: newValue?.routingName || ''
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
                  <CustomTextField
                    name='header.routingName'
                    label={labels.routing}
                    value={formik?.values?.header?.routingName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.jobQty'
                    readOnly={editMode}
                    label={labels.jobQty}
                    value={formik.values?.header?.jobQty}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.jobQty', 0)}
                    required
                    maxAccess={maxAccess}
                    error={formik?.touched?.header?.jobQty && Boolean(formik?.errors?.header?.jobQty)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.jobPcs'
                    readOnly={editMode}
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
                    readOnly={isPosted}
                    required
                    error={formik?.touched?.header?.damagedQty && Boolean(formik?.errors?.header?.damagedQty)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.damagedPcs'
                    readOnly={editMode}
                    label={labels.damagedPcs}
                    value={formik.values?.header?.damagedPcs}
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
                  <CustomNumberField
                    name='header.metalQty'
                    label={labels.metalQty}
                    value={formik.values?.header?.metalQty}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.metalQty', null)}
                    maxAccess={maxAccess}
                    required
                    readOnly={isPosted}
                    error={formik?.touched?.header?.metalQty && Boolean(formik?.errors?.header?.metalQty)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.nonMetalQty'
                    label={labels.nonMetalQty}
                    value={formik.values?.header?.nonMetalQty}
                    onChange={formik.handleChange}
                    readOnly={isPosted}
                    onClear={() => formik.setFieldValue('header.nonMetalQty', null)}
                    maxAccess={maxAccess}
                    required
                    error={formik?.touched?.header?.nonMetalQty && Boolean(formik?.errors?.header?.nonMetalQty)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.netJobQty'
                    label={labels.netJobQty}
                    value={formik.values?.header?.netJobQty}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.netJobQty', null)}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    required
                    error={formik?.touched?.header?.netJobQty && Boolean(formik?.errors?.header?.netJobQty)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='header.netJobPcs'
                    label={labels.netJobPcs}
                    value={formik.values?.header?.netJobPcs}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.netJobPcs', null)}
                    maxAccess={maxAccess}
                    readOnly={isPosted}
                    required
                    error={formik?.touched?.header?.netJobPcs && Boolean(formik?.errors?.header?.netJobPcs)}
                  />
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
