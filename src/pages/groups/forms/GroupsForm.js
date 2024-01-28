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
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'

export default function GroupsForm({ labels, maxAccess, recordId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)
  
  const [initialValues, setInitialData] = useState({
      recordId: null,
      reference: '',
      name: '',
      nraName:''
    })

  const { getRequest, postRequest } = useContext(RequestsContext)

  //const editMode = !!recordId

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
        nraName: yup.string().required('This field is required'),
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

                  //readOnly={editMode}

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

                  //readOnly={editMode}
                  maxLength='30'
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('name', '')}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  />
              </Grid>
              <ResourceLookup
             endpointId={SystemRepository.NumberRange.snapshot}
             parameters={{
              _nraName : SystemRepository.NumberRange.page
             }}
             form={formik}
             valueField='nraName'
             displayField='nraName'
             name='nraName'

            //  readOnly={editMode}
             label={labels.numberRange}

             secondDisplayField={false}

             onChange={(event, newValue) => {

              if (newValue) {
                formik.setFieldValue('nraName', newValue?.recordId)
                formik.setFieldValue('nraName', newValue?.nraName)
              } else {
                formik.setFieldValue('nraName', '')
              }
            }}

            errorCheck={'nraName'}
            />

          </Grid>
      </FormShell>
)
}




{/* <Grid item xs={12}>
<CustomLookup
  name='nraRef'
  label={labels.nuRange}
  valueField='reference'
  displayField='description'
  store={numberRangeStore}
  setStore={setNumberRangeStore}
  firstValue={GroupsValidation.values.nraRef}
  secondValue={GroupsValidation.values.nraDescription}
  onLookup={lookupNumberRange}
  onChange={(event, newValue) => {
    if (newValue) {
      GroupsValidation.setFieldValue('nraId', newValue?.recordId)
      GroupsValidation.setFieldValue('nraRef', newValue?.reference)
      GroupsValidation.setFieldValue('nraDescription', newValue?.description)
    } else {
      GroupsValidation.setFieldValue('nraId', null)
      GroupsValidation.setFieldValue('nraRef', null)
      GroupsValidation.setFieldValue('nraDescription', null)
    }
  }}
  error={GroupsValidation.touched.nra && Boolean(GroupsValidation.errors.nra)}
  helperText={GroupsValidation.touched.nra && GroupsValidation.errors.nra}
  maxAccess={maxAccess}
  editMode={editMode}
/>
</Grid> */}