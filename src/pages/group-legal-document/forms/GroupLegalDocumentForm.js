import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'


// import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'


import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'




export default function GroupLegalDocumentForm({ labels, maxAccess, defaultValue, groupId, incId}){
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!groupId && !!incId )
  
  const [initialValues, setInitialData] = useState({
    groupId: null,
    incId:null,
    required:false,
    mandatory:false 
    })
    const { getRequest, postRequest } = useContext(RequestsContext)

    

    const invalidate = useInvalidate({
        endpointId: BusinessPartnerRepository.GroupLegalDocument.page
      })
  
    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validateOnChange: true,
        validationSchema: yup.object({
          groupId: yup.string().required('This field is required'),
          incId: yup.string().required('This field is required'),
            
        }),
        onSubmit: async obj => {
          const groupId = obj.groupId
          const incId = obj.incId
          

          const response = await postRequest({
            extension: BusinessPartnerRepository.GroupLegalDocument.set,
            record: JSON.stringify(obj)
          })
          
          if (!groupId&&!incId) {
            
            toast.success('Record Added Successfully')
            setInitialData({
              ...obj, // Spread the existing properties
              groupId: response.groupId,
              incId : response.incId,
              
            });
            setEditMode(false)
          }
          else toast.success('Record Edited Successfully')
          setEditMode(true)

          invalidate()
        }
      })
    
      useEffect(() => {
        ;(async function () {
          try {
            if (incId && groupId ) {
              setIsLoading(true)
    
              const res = await getRequest({
                extension: BusinessPartnerRepository.GroupLegalDocument.get,
                parameters: `_groupId=${groupId}&_incId=${incId}`
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
            resourceId={ResourceIds.GroupLegalDocument}
            form={formik} 
            height={300} 
            maxAccess={maxAccess} 
            editMode={editMode}
        >
            <Grid container spacing={4}>
                <Grid item xs={12}>
                <ResourceComboBox
                readOnly={editMode}
                endpointId={BusinessPartnerRepository.Group.qry}
                name='groupId'
                label={labels.group}
                valueField='recordId'
                displayField= {['reference', 'name']}
                
                columnsInDropDown= {[
                    { key: 'reference', value: ' Ref' },
                    { key: 'name', value: 'Name' },
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                    formik && formik.setFieldValue('groupId', newValue?.recordId)
                }}
                error={formik.touched.groupId && Boolean(formik.errors.groupId)}
                helperText={formik.touched.groupId && formik.errors.groupId}
                  />
                </Grid>
                <Grid item xs={12}>
                <ResourceComboBox
                readOnly={editMode}
                endpointId={
                  BusinessPartnerRepository.CategoryID.qry}
                name='incId'
                label={labels.categoryId}
                valueField='recordId'
                displayField={'name'}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                    formik && formik.setFieldValue('incId', newValue?.recordId)
                }}
                error={formik.touched.incId && Boolean(formik.errors.incId)}
                helperText={formik.touched.incId && formik.errors.incId}
                  />
                </Grid>
                <Grid item xs={12}>
                 <FormControlLabel
                control={
                  <Checkbox
                    name='required'
                    valueField='recordId'
                    
                    maxAccess={maxAccess}
                    checked={formik.values.required}
                    onChange={(event) => {
                      formik && formik.setFieldValue('required', event.target.checked)
                    }}
                  />
                }
                label={labels.required}
              />
            </Grid>
            <Grid item xs={12}>
                 <FormControlLabel
                control={
                  <Checkbox
                    name='mandatory'
                    valueField='recordId'
                    
                    maxAccess={maxAccess}
                    checked={formik.values.mandatory}
                    onChange={(event) => {
                      formik && formik.setFieldValue('mandatory', event.target.checked)
                    }}
                  />
                }
                label={labels.mandatory}
              />
            </Grid>

            </Grid>
        </FormShell>
  )
}
















//     return (
//         <>
//           <Grid container spacing={4}>
//               <Grid item xs={12}>
//                 <ResourceComboBox
//                   name='groupId'
//                   label={labels.group}
//                   valueField='recordId'
//                   displayField='name'
//                   columnsInDropDown= {[
//                     { key: 'reference', value: 'Reference' },
//                     { key: 'name', value: 'Name' }
//                   ]}
//                   store={groupStore}
//                   value={groupStore.filter(item => item.recordId === groupLegalDocumentValidation.values.groupId)[0]}
//                   required
//                   maxAccess={maxAccess}
//                   readOnly={editMode}
//                   onChange={(event, newValue) => {
//                     groupLegalDocumentValidation.setFieldValue('groupId', newValue?.recordId)
//                   }}
//                   error={
//                     groupLegalDocumentValidation.touched.groupId &&
//                     Boolean(groupLegalDocumentValidation.errors.groupId)
//                   }
//                   helperText={
//                     groupLegalDocumentValidation.touched.groupId && groupLegalDocumentValidation.errors.groupId
//                   }
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <CustomComboBox
//                   name='incId'
//                   label={labels.categoryId}
//                   valueField='recordId'
//                   displayField='name'
//                   store={categoryStore}
//                   value={categoryStore.filter(item => item.recordId === groupLegalDocumentValidation.values.incId)[0]}
//                   required
//                   maxAccess={maxAccess}
//                   readOnly={editMode}
//                   onChange={(event, newValue) => {
//                     groupLegalDocumentValidation.setFieldValue('incId', newValue?.recordId)
//                   }}
//                   error={
//                     groupLegalDocumentValidation.touched.incId && Boolean(groupLegalDocumentValidation.errors.incId)
//                   }
//                   helperText={
//                     groupLegalDocumentValidation.touched.incId && groupLegalDocumentValidation.errors.incId
//                   }
//                 />
//               </Grid>
              
//               </Grid>
//             </Grid>
        
//         </>
//     )
// }




// <Grid item xs={12}>
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       name='required'
//                       maxAccess={maxAccess}
//                       checked={groupLegalDocumentValidation.values?.required}
//                       onChange={groupLegalDocumentValidation.handleChange}
//                     />
//                   }
//                   label={labels.required}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       name='mandatory'
//                       maxAccess={maxAccess}
//                       checked={groupLegalDocumentValidation.values?.mandatory}
//                       onChange={groupLegalDocumentValidation.handleChange}
//                     />
//                   }
//                   label={labels.mandatory}
//                 />