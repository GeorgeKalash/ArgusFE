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

export default function SalaryRangeForm ({labels, maxAccess,recordId}){
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)
  
  const [initialValues, setInitialData] = useState({
      recordId: null,
      min: '',
      max: '',
    })

    const { getRequest, postRequest } = useContext(RequestsContext)

    const invalidate = useInvalidate({
      endpointId: RemittanceSettingsRepository.SalaryRange.page,
    })

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      validateOnChange: true,
      validationSchema: yup.object({
        min: yup.string().required('This field is required')
        .test('minValue', 'Minimum value is 1', value => {
          return value > 0
        }),
        max: yup.string().required('This field is required')
      }),
      onSubmit: async obj => {
        try{
        const recordId = obj.recordId

        const response = await postRequest({
          extension: RemittanceSettingsRepository.SalaryRange.set,
          record: JSON.stringify(obj)
        })
        
        if (!recordId) {
          toast.success('Record Added Successfully')
          setInitialData({
            ...obj, // Spread the existing properties
            recordId: response.recordId, // Update only the recordId field
          });
        }
        else toast.success('Record Edited Successfully')
        setEditMode(true)
        invalidate()
      }
      catch (exception) {
        setErrorMessage(error)
  }
}
    })

       useEffect(() => {
        ;(async function () {
          try {
            if (recordId) {
              setIsLoading(true)

              const res = await getRequest({
                extension: RemittanceSettingsRepository.SalaryRange.get,
                parameters: `_recordId=${recordId}`
              })
              
              setInitialData(res.record)
            }
          } catch (exception) {
            setErrorMessage(error)
          }
          setIsLoading(false)
        })()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

    return (
      <FormShell 
      resourceId={ResourceIds.SalaryRange}
      form={formik} 
      height={300} 
      maxAccess={maxAccess} 
      editMode={editMode}
      >
        <Grid container spacing={4} style={{ marginTop: '0.1rem' }}>
          <Grid item xs={12}>
            <CustomTextField
              name='min'
              label={labels.min}
              value={formik.values.min}
              required
              maxLength = '10'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('min', '')}
              error={formik.touched.min && Boolean(formik.errors.min)}

              // helperText={formik.touched.min && formik.errors.min}
            />
          </Grid>
          <Grid item xs={12}>
          <CustomTextField
              name='max'
              label={labels.max}
              value={formik.values.max}
              required
              maxLength = '10'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('max', '')}
              error={formik.touched.max && Boolean(formik.errors.max)}

              // helperText={formik.touched.max && formik.errors.max}
            />
          </Grid>

          </Grid>
             
      </FormShell>
    )
}

