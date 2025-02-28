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
    enabled: !recordId
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: recordId || '',
      dtId: documentType?.dtId,
      reference: '',
      date: new Date(),
      plantId: null,
      notes: '',
      status: 1,
      jobId: null,
      seqNo: 0,
      pcs: 0,
      workCenterId: null,
      maxPcs: 50
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      plantId: yup.string().required(),
      jobId: yup.string().required(),
      date: yup.string().required(),
      pcs: yup.lazy((_, { parent }) =>
        yup
          .number()
          .min(0)
          .max(parent.maxPcs, ({ max }) => `Must be less than or equal to ${max}`)
          .nullable(true)
      )
    }),
    onSubmit: async obj => {
      postRequest({
        extension: ManufacturingRepository.Damage.set,
        record: JSON.stringify({ ...obj, date: formatDateToApi(obj.date) })
      }).then(async res => {
        toast.success(editMode ? platformLabels.Edited : platformLabels.Added)
        await refetchForm(res.recordId)
        invalidate()
      })
    }
  })

  async function refetchForm(damageId) {
    await getRequest({
      extension: ManufacturingRepository.Damage.get,
      parameters: `_recordId=${damageId}`
    }).then(async res => {
      await refetchFormJob(res?.record?.jobId, res.record)
    })
  }

  async function refetchFormJob(jobId, res) {
    await getRequest({
      extension: ManufacturingRepository.MFJobOrder.get,
      parameters: `_recordId=${jobId}`
    }).then(jobRes => {
      formik.setValues({
        ...formik.values,
        ...res,
        date: formatDateFromApi(jobRes?.record?.date),
        sku: jobRes?.record?.sku,
        itemName: jobRes?.record?.itemName,
        designName: jobRes?.record?.designName,
        designRef: jobRes?.record?.designRef,
        maxPcs: jobRes.record.pcs
      })
    })
  }

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status === 3

  const onPost = async () => {
    await postRequest({
      extension: ManufacturingRepository.Damage.post,
      record: JSON.stringify(formik.values)
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

  useEffect(() => {
    if (documentType?.dtId) {
      formik.setFieldValue('dtId', documentType.dtId)
    }
  }, [documentType?.dtId])

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
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.Damage}`}
                name='dtId'
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={editMode}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId)
                  changeDT(newValue)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={7}></Grid>
            <Grid item xs={5}>
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
            <Grid item xs={7}></Grid>
            <Grid item xs={5}>
              <ResourceLookup
                endpointId={ManufacturingRepository.MFJobOrder.snapshot}
                filter={{ status: 4 }}
                valueField='reference'
                displayField='reference'
                secondDisplayField={false}
                name='jobId'
                label={labels.jobOrder}
                form={formik}
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
                onChange={(event, newValue) => {
                  formik.setValues({
                    ...formik.values,
                    jobId: newValue?.recordId || null,
                    jobRef: newValue?.reference || '',
                    sku: newValue?.sku || '',
                    designRef: newValue?.designRef || '',
                    designName: newValue?.designName || '',
                    itemName: newValue?.itemName || '',
                    wcName: newValue?.wcName || '',
                    workCenterId: newValue?.workCenterId || null,
                    plantId: newValue?.plantId || null,
                    maxPcs: newValue?.pcs || 0
                  })
                }}
                errorCheck={'jobId'}
              />
            </Grid>
            <Grid item xs={7}></Grid>
            <Grid item xs={5}>
              <CustomTextField
                name='sku'
                label={labels.item}
                value={formik?.values?.sku}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={5}>
              <CustomTextField name='itemName' value={formik?.values?.itemName} maxAccess={maxAccess} readOnly />
            </Grid>
            <Grid item xs={5}>
              <CustomTextField
                name='designRef'
                label={labels.designRef}
                value={formik?.values?.designRef}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={5}>
              <CustomTextField name='designName' value={formik?.values?.designName} maxAccess={maxAccess} readOnly />
            </Grid>
            <Grid item xs={5}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                required
                readOnly={isPosted}
                label={labels.plant}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}></Grid>
            <Grid item xs={12}></Grid>
            <Grid item xs={12}></Grid>
            <Grid item xs={5}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                editMode={editMode}
                readOnly={editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={7}></Grid>
            <Grid item xs={5}>
              <CustomTextField
                name='wcName'
                label={labels.workCenter}
                value={formik?.values?.wcName}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={7}></Grid>
            <Grid item xs={5}>
              <CustomNumberField
                name='pcs'
                readOnly={editMode}
                label={labels.damagedPcs}
                value={formik.values?.pcs}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('pcs', 0)}
                maxAccess={maxAccess}
                error={formik.touched.pcs && Boolean(formik.errors.pcs)}
                helperText={formik.touched.pcs && formik.errors.pcs}
              />
            </Grid>
            <Grid item xs={7}></Grid>
            <Grid item xs={7}>
              <CustomTextArea
                name='notes'
                label={labels.remarks}
                value={formik.values.notes}
                rows={4}
                editMode={editMode}
                readOnly={isPosted}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('notes', e.target.value)}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
