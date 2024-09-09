import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useInvalidate } from 'src/hooks/resource'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { DataSets } from 'src/resources/DataSets'
import { SCRepository } from 'src/repositories/SCRepository'

const LabelTemplateForm = ({ labels, maxAccess, store, setStore }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: SCRepository.LabelTemplate.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: recordId,
      name: '',
      width: '',
      height: '',
      labelHomeX: '',
      labelHomeY: '',
      format: ''
    },
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      name: yup.string().required(),
      width: yup.string().required(),
      height: yup.string().required(),
      labelHomeX: yup.number().nullable().min(0),
      labelHomeY: yup.number().nullable().min(0)
    }),
    onSubmit: async values => {
      await postLabelTemplate(values)
    }
  })

  const editMode = !!formik.values.recordId

  const postLabelTemplate = async obj => {
    await postRequest({
      extension: SCRepository.LabelTemplate.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!obj.recordId) {
          formik.setFieldValue('recordId', res.recordId)
          toast.success(platformLabels.Added)
        } else toast.success(platformLabels.Edited)
        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId
        }))
        invalidate()
      })
      .catch(error => {})
  }

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: SCRepository.LabelTemplate.get,
            parameters: `_recordId=${recordId}`
          })

          var result = res.record
          formik.setValues(result)
          setStore(prevStore => ({
            ...prevStore,
            recordId: result.recordId
          }))
        }
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell form={formik} resourceId={ResourceIds.LabelTemplates} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            value={formik.values.name}
            required
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomNumberField
            name='width'
            type='number'
            label={labels.width}
            value={formik.values.width}
            required
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('width', '')}
            error={formik.touched.width && Boolean(formik.errors.width)}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='height'
            type='number'
            label={labels.height}
            value={formik.values.height}
            required
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('height', '')}
            error={formik.touched.height && Boolean(formik.errors.height)}
            maxAccess={maxAccess}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            name='labelHomeX'
            type='number'
            label={'X'}
            value={formik.values.labelHomeX}
            maxLength='30'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('labelHomeX', '')}
            error={formik.touched.labelHomeX && Boolean(formik.errors.labelHomeX)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='labelHomeY'
            type='number'
            label={'Y'}
            value={formik.values.labelHomeY}
            maxLength='30'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('labelHomeY', '')}
            error={formik.touched.labelHomeY && Boolean(formik.errors.labelHomeY)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            name='format'
            datasetId={DataSets.SC_LABEL_PRINT_FORMAT}
            label={labels.format}
            valueField='key'
            displayField='value'
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('format', newValue?.key || '')
            }}
            error={formik.touched.format && Boolean(formik.errors.format)}
            maxAccess={maxAccess}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default LabelTemplateForm
