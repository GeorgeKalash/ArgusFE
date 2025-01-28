import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
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

export default function DamageForm({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [max, setMax] = useState(50)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.Damage,
    access: access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Damage.page
  })

  useEffect(() => {
    if (documentType?.dtId) {
      formik.setFieldValue('dtId', documentType.dtId)
    }
  }, [documentType?.dtId])

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
      workCenterId: null
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      plantId: yup.string().required(),
      jobId: yup.string().required(),
      date: yup.string().required(),
      pcs: yup
        .number()
        .min(0)
        .max(max, 'Must be less than or equal to' + max)
        .nullable(true)
    }),
    onSubmit: async obj => {
      postRequest({
        extension: ManufacturingRepository.Damage.set,
        record: JSON.stringify({ ...obj, date: formatDateToApi(obj.date) })
      }).then(async res => {
        const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
        toast.success(actionMessage)
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
      await getRequest({
        extension: ManufacturingRepository.MFJobOrder.get,
        parameters: `_recordId=${res?.record?.jobId}`
      }).then(jobRes => {
        formik.setValues({
          ...res?.record,
          date: formatDateFromApi(res?.record?.date),
          sku: jobRes?.record?.sku,
          itemName: jobRes?.record?.itemName,
          designName: jobRes?.record?.designName,
          designRef: jobRes?.record?.designRef
        })
        setMax(jobRes?.record?.pcs)
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
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !editMode || isPosted
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await refetchForm(recordId)
      }
    })()
  }, [])

  console.log('max', maxAccess)
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
      disabledSubmit={isPosted && !editMode}
      disabledSavedClear={isPosted && !editMode}
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
                required
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId)
                  changeDT(newValue)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={5}></Grid>
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
            <Grid item xs={5}></Grid>
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
                onChange={async (event, newValue) => {
                  formik.setFieldValue('jobId', newValue?.recordId)
                  formik.setFieldValue('jobRef', newValue?.reference)
                  formik.setFieldValue('sku', newValue?.sku)
                  formik.setFieldValue('designRef', newValue?.designRef)
                  formik.setFieldValue('designName', newValue?.designName)
                  formik.setFieldValue('itemName', newValue?.itemName)
                  formik.setFieldValue('wcName', newValue?.wcName)
                  formik.setFieldValue('workCenterId', newValue?.workCenterId)
                  formik.setFieldValue('plantId', newValue?.plantId)
                  setMax(newValue?.pcs)
                }}
                errorCheck={'jobId'}
              />
            </Grid>
            <Grid item xs={5}></Grid>
            <Grid item xs={5}>
              <CustomTextField
                name='sku'
                label={labels.item}
                value={formik?.values?.sku}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={5}>
              <CustomTextField
                name='itemName'
                value={formik?.values?.itemName}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={5}>
              <CustomTextField
                name='designRef'
                label={labels.designRef}
                value={formik?.values?.designRef}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={5}>
              <CustomTextField
                name='designName'
                value={formik?.values?.designName}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
              />
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
            <Grid item xs={10}></Grid>
            <Grid item xs={10}></Grid>
            <Grid item xs={10}></Grid>
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
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={5}></Grid>
            <Grid item xs={5}>
              <CustomTextField
                name='wcName'
                label={labels.workCenter}
                value={formik?.values?.wcName}
                maxAccess={maxAccess}
                readOnly
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={5}></Grid>
            <Grid item xs={5}>
              <CustomNumberField
                name='pcs'
                readOnly={editMode}
                label={labels.damagedPcs}
                value={formik.values?.pcs}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('pcs', '')}
                maxAccess={maxAccess}
                error={formik.touched.pcs && Boolean(formik.errors.pcs)}
                helperText={formik.touched.pcs && formik.errors.pcs}
              />
            </Grid>
            <Grid item xs={5}></Grid>
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
