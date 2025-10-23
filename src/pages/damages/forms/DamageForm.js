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
        pcs: 0,
        workCenterId: null,
        maxPcs: 50,
        qty: 0,
        jobQty: 0,
        damageRate: 0
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
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={4}>
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
            <Grid item xs={4}>
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
                      damageRate: (formik.values.qty / newValue?.qty) * 100 || 0
                    }
                  })
                }}
                errorCheck={'header.jobId'}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomNumberField
                name='header.pcs'
                readOnly={editMode}
                label={labels.damagedPcs}
                value={formik.values?.header?.pcs}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.pcs', 0)}
                required
                maxAccess={maxAccess}
                error={formik?.touched?.header?.pcs && Boolean(formik?.errors?.header?.pcs)}
              />
            </Grid>
            <Grid item xs={4}>
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
            <Grid item xs={4}>
              <Grid container xs={12} spacing={2}>
                <Grid item xs={6}>
                  <CustomTextField
                    name='header.sku'
                    label={labels.item}
                    value={formik?.values?.header?.sku}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='header.itemName'
                    value={formik?.values?.header?.itemName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <CustomNumberField
                name='header.qty'
                label={labels.qty}
                value={formik.values?.header?.qty}
                onChange={e => {
                  formik.setFieldValue(
                    'header.damageRate',
                    (e.target.value / formik?.values?.header?.jobQty) * 100 || 0
                  )
                  formik.setFieldValue('header.qty', e.target.value)
                }}
                maxLength={11}
                decimalScale={2}
                onClear={() => {
                  formik.setFieldValue('header.damageRate', null)
                  formik.setFieldValue('header.qty', null)
                }}
                maxAccess={maxAccess}
                readOnly={isPosted}
                required
                error={formik?.touched?.header?.qty && Boolean(formik?.errors?.header?.qty)}
              />
            </Grid>
            <Grid item xs={4}>
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
            <Grid item xs={4}>
              <Grid container xs={12} spacing={2}>
                <Grid item xs={6}>
                  <CustomTextField
                    name='header.designRef'
                    label={labels.designRef}
                    value={formik?.values?.header?.designRef}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='header.designName'
                    value={formik?.values?.header?.designName}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <CustomNumberField
                name='header.jobQty'
                label={labels.jobQty}
                value={formik.values?.header?.jobQty}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.jobQty', null)}
                maxAccess={maxAccess}
                readOnly
                error={formik?.touched?.header?.jobQty && Boolean(formik?.errors?.header?.jobQty)}
              />
            </Grid>
            <Grid item xs={4}>
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
              <CustomTextField
                name='header.workCenterName'
                label={labels.workCenter}
                value={formik?.values?.header?.workCenterName}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomNumberField
                name='header.damageRate'
                label={labels.damageRate}
                value={formik.values?.header?.damageRate}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('header.damageRate', 0)}
                maxAccess={maxAccess}
                readOnly
                required
                error={formik?.touched?.header?.damageRate && Boolean(formik?.errors?.header?.damageRate)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.Labor.qry2}
                parameters={`_workCenterId=${formik?.values?.header?.workCenterId || 0}`}
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
            <Grid item xs={4}>
              <CustomButton
                onClick={onPreview}
                image={'preview.png'}
                tooltipText={platformLabels.Preview}
                disabled={isPosted}
              />
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
          <Grid container spacing={2}>
            <Grid item xs={7}>
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
