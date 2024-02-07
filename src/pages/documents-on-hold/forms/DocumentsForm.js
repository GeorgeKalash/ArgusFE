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
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'



export default function DocumentsForm({ labels, maxAccess,functionId,seqNo,recordId }) {
    const [isLoading, setIsLoading] = useState(false)


    const [initialValues, setInitialData] = useState({
        recordId: null,
        reference: '',
        functionId: "",
        seqNo:'',
        thirdParty:'',
        functionName:'',
        date:'',
        notes:''
        

      })

    const { getRequest, postRequest } = useContext(RequestsContext)

    //const editMode = !!recordId

    const invalidate = useInvalidate({
        endpointId: DocumentReleaseRepository.DocumentsOnHold.qry
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
          
          const functionId = initialValues.functionId
          const seqNo = initialValues.seqNo
          const recordId = initialValues.recordId

          const response = await postRequest({
            extension: DocumentReleaseRepository.DocumentsOnHold.set,
            record: JSON.stringify(obj)
          })
          
          if (!functionId&&!seqNo) {
            toast.success('Record Added Successfully')
            setInitialData({
              ...obj, // Spread the existing properties
              recordId: response.recordId, // Update only the recordId field
            });
          }
          else toast.success('Record Edited Successfully')

          invalidate()
        }
      })
    
      useEffect(() => {
        ;(async function () {
          try {
              setIsLoading(true)
    
              const res = await getRequest({
                extension: DocumentReleaseRepository.DocumentsOnHold.get,
                parameters: `_functionId=${functionId}&_seqNo=${seqNo}&_recordId=${recordId}`
              })
           
              setInitialData(...res.record)
            
          } catch (exception) {
            setErrorMessage(error)
          }
          setIsLoading(false)
        })()
      }, [])
      
    return (
        <FormShell 
            resourceId={ResourceIds.DocumentsOnHold}
            form={formik} 
            height={300} 
            maxAccess={maxAccess} 
        
        >
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik.values.reference}
                    readOnly={true}
                    maxAccess={maxAccess}
                    maxLength='30'
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomTextField
                    name='thirdParty'
                    label={labels.thirdParty}
                    value={formik.values.thirdParty}
                    readOnly={true}
                    maxAccess={maxAccess}
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomTextField
                    name='date'
                    label={labels.date}
                    value={formik.values.date}
                    readOnly={true}
                    maxAccess={maxAccess}
                    />
                </Grid>
                <Grid item xs={12}>
                    <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik.values.notes}
                    required
                    maxLength='100'
                    rows={2}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}

                    />
                </Grid>

            </Grid>
        </FormShell>
  )
}