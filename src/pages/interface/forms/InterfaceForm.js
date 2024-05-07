// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function InterfaceForm({ labels, recordId, maxAccess }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    name: '',
    reference: '',
    path: '',
    description: ''
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.Interface.page
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required('This field is required'),
      reference: yup.string().required('This field is required'),
      path: yup.string().required('This field is required'),
      description: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: RemittanceSettingsRepository.Interface.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj, // Spread the existing properties
          recordId: response.recordId // Update only the recordId field
        })
      } else toast.success('Record Edited Successfully')
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: RemittanceSettingsRepository.Interface.get,
            parameters: `_recordId=${recordId}`
          })

          setInitialData(res.record)
        }
      } catch (exception) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Interface} form={formik} height={300} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomNumberField
            name='recordId'
            label={labels.id}
            value={formik?.values?.recordId}
            decimalScale={0}
            thousandSeparator=''
            required
            onChange={formik.handleChange}
            maxLength='15'
            readOnly={editMode}
            maxAccess={maxAccess}
            onClear={() => formik.setFieldValue('recordId', '')}
            error={formik.touched.recordId && Boolean(formik.errors.recordId)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            required
            onChange={formik.handleChange}
            maxLength='10'
            maxAccess={maxAccess}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
            helperText={formik.touched.reference && formik.errors.reference}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            value={formik.values.name}
            required
            maxLength='50'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='path'
            label={labels.path}
            value={formik.values.path}
            required
            maxLength='100'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('path', '')}
            error={formik.touched.path && Boolean(formik.errors.path)}
            helperText={formik.touched.path && formik.errors.path}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='description'
            label={labels.description}
            value={formik.values.description}
            required
            maxLength='200'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('description', '')}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
