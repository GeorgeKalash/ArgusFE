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
import { ResourceLookup } from 'src/components/Shared//ResourceLookup'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'


import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'

export default function GroupsForm({ labels, maxAccess, recordId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)
  
  
  const [initialValues, setInitialData] = useState({
      recordId: null,
      reference: '',
      name: '',
      nraDescription:'',
      nraRef: '',
      nraId: null,
      
     
    })

  const { getRequest, postRequest } = useContext(RequestsContext)



  const invalidate = useInvalidate({
      endpointId: BusinessPartnerRepository.Groups.page
    })

  const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      validateOnChange: true,
      validationSchema: yup.object({
        reference: yup.string().required('This field is required'),
        name: yup.string().required('This field is required'),

      }),
      onSubmit: async obj => {
        const recordId = obj.recordId

        const response = await postRequest({
          extension: BusinessPartnerRepository.Groups.set,
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
    })
  
    useEffect(() => {
      ;(async function () {
        try {
          if (recordId) {
            setIsLoading(true)
  
            const res = await getRequest({
              extension: BusinessPartnerRepository.Groups.get,
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
          resourceId={ResourceIds.Groups}
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
                  value={formik.values.reference}
                  required
                  rows={2}

                  maxAccess={maxAccess}
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
               
              <ResourceLookup
             endpointId={SystemRepository.NumberRange.snapshot}
             form={formik}
             valueField='reference'
             displayField='description'
             name='nraRef'
             label={labels.numberRange}
             secondDisplayField={true}
             secondValue={formik.values.nraDescription}
             onChange={(event, newValue) => {

              if (newValue) {
                formik.setFieldValue('nraId', newValue?.recordId)
                formik.setFieldValue('nraRef', newValue?.reference)
                formik.setFieldValue('nraDescription', newValue?.description)
                
              } else {
                formik.setFieldValue('nraId', null)
                formik.setFieldValue('nraRef', '')
                formik.setFieldValue('nraDescription', '')

              }
            }}

            error={
              formik.touched.nraId &&
              Boolean(formik.errors.nraId)
            }
            helperText={
              formik.touched.nraId &&
              formik.errors.nraId
            }
            /> 
            </Grid>
            
          </Grid>
      </FormShell>
)
}



