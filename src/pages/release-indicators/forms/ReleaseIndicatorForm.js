// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { DataSets } from 'src/resources/DataSets'
import { Dataset } from '@mui/icons-material'

export default function ReleaseIndicatorForm({ labels, maxAccess, recordId, setWindowOpen }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    name: '',
    reference: '',
    changeability: '',
    isReleased: false
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  //const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.ReleaseIndicator.page
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required('This field is required'),
      reference: yup.string().required('This field is required'),

      recordId: yup.string().required('This field is required'),
      changeability: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: DocumentReleaseRepository.ReleaseIndicator.set,
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
      setWindowOpen(false)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: DocumentReleaseRepository.ReleaseIndicator.get,
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
    <FormShell
      resourceId={ResourceIds.ReleaseIndicators}
      form={formik}
      height={300}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            readOnly={editMode}
            value={formik.values.reference}
            required
            maxAccess={maxAccess}
            maxLength='1'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
            helperText={formik.touched.reference && formik.errors.reference}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            readOnly={editMode}
            value={formik.values.name}
            required
            maxAccess={maxAccess}
            maxLength='30'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='recordId'
            label={labels.id}
            readOnly={editMode}
            value={formik.values.recordId}
            required
            maxAccess={maxAccess}
            maxLength='30'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('recordId', '')}
            error={formik.touched.recordId && Boolean(formik.errors.recordId)}
            helperText={formik.touched.recordId && formik.errors.recordId}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            readOnly={false}
            datasetId={DataSets.DR_CHANGEABILITY}
            name='changeability'
            label={labels.changeability}
            valueField='key'
            displayField='value'
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik && formik.setFieldValue('changeability', newValue?.key)
            }}
            error={formik.touched.changeability && Boolean(formik.errors.changeability)}
            helperText={formik.touched.changeability && formik.errors.changeability}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name='isReleased'
                maxAccess={maxAccess}
                checked={formik.values?.isReleased}
                onChange={formik.handleChange}
              />
            }
            label={labels.isReleased}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
