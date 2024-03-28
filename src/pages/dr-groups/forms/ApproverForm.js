
import { useState, useContext } from 'react'
import { useFormik } from 'formik'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'

import {  useEffect } from 'react'
import App from 'src/pages/_app'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { DocumentReleaseRepository} from 'src/repositories/DocumentReleaseRepository'

import * as yup from 'yup'
import toast from 'react-hot-toast'
import { grid } from '@mui/system'
import { ResetTvRounded } from '@mui/icons-material'




const ApproverForm= ({
    labels,
    editMode,
    maxAccess,
    setEditMode,
    recordId,
    store,
    setRefresh
  }) => {
  
    const { postRequest, getRequest} = useContext(RequestsContext)
    
    const {recordId:grId} = store



  
    const [initialValues , setInitialData] = useState({
      
      codeId:'',
      groupId:grId

   
    })
  
    const formik = useFormik({
      enableReinitialize: true,
      validateOnChange: true,
      initialValues,
      validationSchema: yup.object({
        codeId: yup.string().required('This field is required'),

       
      }),
      onSubmit: values => {
        postGroups(values)
    
      }
    })
  
    const postGroups = async obj => {
      const isNewRecord = !obj?.codeId;
      
      
      try {
        const res = await postRequest({
          extension:DocumentReleaseRepository.GroupCode.set,
          record: JSON.stringify(obj)
        });
        
        if (isNewRecord) {
          toast.success('Record Added Successfully');
          setInitialData(prevData => ({
            ...prevData,
            ...obj,
            
          }));
          setEditMode(true); 
        } else {
          
          toast.success('Record Edited Successfully');
          setInitialData(prevData => ({
            ...prevData,
            
            ...obj,
            
          })
          
          );
          console.log('ooooooooooooooooooooooooooo',obj.codeId)
        }
        setRefresh(prev=>!prev)
      } catch (error) {
       
        toast.error('An error occurred');
      }
    };
   useEffect(() => {
    recordId && getGroupId(recordId);
  }, [recordId]);
  
    const getGroupId = codeId => {
      const defaultParams =  `_codeId=${codeId}&_groupId=${grId}`;
      var parameters = defaultParams;
      getRequest({
        extension: DocumentReleaseRepository.GroupCode.get,
        parameters: `_groupId=${recordId}`
      })
        .then(res => {
          setInitialData(res.record); 
          setEditMode(true);
        
        })
        .catch(error => {
        });
    };
  
  return (
      <FormShell
      form={formik}
      resourceId={ResourceIds.DRGroups}
      maxAccess={maxAccess}
      editMode={editMode} >
       <Grid container spacing={4}>
        <Grid item xs={12}>
        <ResourceComboBox
     endpointId={DocumentReleaseRepository.ReleaseCode.qry}
     parameters={`_startAt=${0}&_pageSize=${100}`}
     name='codeId'
     label={'codeId'}
     valueField='recordId'
     displayField='name'
     values={formik.values}
     required
     readOnly={editMode}
     maxAccess={maxAccess}
     onChange={(event, newValue) => {
       formik.setFieldValue('codeId', newValue?.recordId)
     }}
     error={formik.touched.codeId && Boolean(formik.errors.codeId)}
/>
        </Grid>
     
        </Grid>
  
          
      </FormShell>
    )
  }

  export default ApproverForm
  