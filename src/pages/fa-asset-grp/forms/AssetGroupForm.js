import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { FixedAssetsRepository } from 'src/repositories/FixedAssetsRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from '../../../repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { DataSets } from 'src/resources/DataSets'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { MasterSource } from 'src/resources/MasterSource'

const validationSchema = yup.object({
  reference: yup.string().required(),
  name: yup.string().required()
})

const initialValues = {
  recordId: null,
  reference: null,
  name: ''
}

export default function AssetGroupForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: FixedAssetsRepository.AssetGroup.page
  })

  const { formik } = useForm({
    initialValues,
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema,
    onSubmit: handleSubmit
  })

  const handleNumberRangeChange = (event, newValue) => {
    formik.setFieldValue('nraId', newValue?.recordId || null)
    formik.setFieldValue('nraRef', newValue?.reference || '')
    formik.setFieldValue('nraDescription', newValue?.description || '')
  }

  async function handleSubmit(values) {
    const response = await postRequest({
      extension: FixedAssetsRepository.AssetGroup.set,
      record: JSON.stringify(values)
    })

    if (!values.recordId) {
      toast.success(platformLabels.Added)
      formik.setFieldValue('recordId', response.recordId)
    } else {
      toast.success(platformLabels.Edited)
    }
    invalidate()
  }

  useEffect(() => {
    const fetchRecord = async () => {
      if (recordId) {
        const res = await getRequest({
          extension: FixedAssetsRepository.AssetGroup.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    }

    fetchRecord()
  }, [recordId])

  const editMode = !!recordId || !!formik.values.recordId

  const actions = [
    {
      key: 'Integration Account',
      condition: true,
      onClick: 'onClickGIA',
      disabled: !recordId && !formik.values.recordId,
      editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.AssetGroup}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      masterSource={MasterSource.AssetGroup}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values?.reference}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                maxLength={10}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values?.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                maxLength={30}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.FA_DEPRECIATION_METHOD}
                name='depMethod'
                label={labels.deprecation}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(_, newValue) => formik.setFieldValue('depMethod', newValue?.key ?? '')}
                error={formik.touched.depMethod && Boolean(formik.errors.depMethod)}
                maxAccess={maxAccess}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SystemRepository.NumberRange.snapshot}
                form={formik}
                valueField='reference'
                displayField='description'
                name='nraRef'
                label={labels.numberRange}
                secondDisplayField
                secondValue={formik.values.nraDescription}
                onChange={handleNumberRangeChange}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
