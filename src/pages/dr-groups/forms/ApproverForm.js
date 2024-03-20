
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
import { DataSets } from 'src/resources/DataSets'
import { SystemFunction } from 'src/resources/SystemFunction'


// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'

import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'


export default function ApproverForm ({
  labels,
  maxAccess,
  recordId,


})
{

    const [isLoading, setIsLoading] = useState(false)
    const [editMode, setEditMode] = useState(!!recordId)
    const [groupId, setGroupId] = useState(null);


    const [initialValues, setInitialData] = useState({
        recordId: null,
        codeId:'',
        groupId:''
        
      })

    const { getRequest, postRequest } = useContext(RequestsContext)

    const invalidate = useInvalidate({
        endpointId:DocumentReleaseRepository.GroupCode.qry
      })

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validateOnChange: true,
        validationSchema: yup.object({
          codeId: yup.string().required('This field is required'),
       
          }),
          onSubmit: async obj => {
            
            const recordId = obj.recordId
      
            const response = await postRequest({
              extension: DocumentReleaseRepository.GroupCode.set,
              record: JSON.stringify(obj)
              
            })
           
            if (!recordId) {
              toast.success('Record Added Successfully')
              setInitialData({
                ...obj, // Spread the existing properties
                groupId:obj.groupId,
                recordId: response.recordId // Update only the recordId field
              })
            } else toast.success('Record Edited Successfully')
            setEditMode(true)
      
            invalidate()
          }
        })
      console.log(formik)
        useEffect(() => {
          ;(async function () {
            try {
              if (recordId) {
                setIsLoading(true)
      
                const res = await getRequest({
                  extension: DocumentReleaseRepository.GroupCode.get,
                  parameters: `_recordId=${recordId}&_groupId=${groupId}`
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
    resourceId={ResourceIds.DRGroups}
    form={formik}
    height={400}
    maxAccess={maxAccess}
    editMode={editMode}

    >
    <Grid container spacing={4} sx={{ px: 4 }}>
          
            <Grid item xs={12}>
              <ResourceComboBox
              endpointId={DocumentReleaseRepository.GroupCode.qry}
                name='codeId'
                label={labels.fromDocument}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                parameters={`_groupId=${groupId}`}
               
                maxAccess={maxAccess}
                
                onChange={(event, newValue) => {
                  formik.setFieldValue('codeId', newValue?.recordId)

                }}
                error={
                    formik.touched.codeId && Boolean(formik.errors.codeId)
                }
                helperText={formik.touched.codeId && formik.errors.codeId}
 
              />
 
            </Grid>

          </Grid>
    </FormShell>
  )
}




{/* <Grid container xs={12} spacing={2}>
<Grid item xs={12}>
  <CustomComboBox
    name='codeId'
    label={_labels.approver}
    valueField='recordId'
    displayField='name'
    store={approverComboStore}
    value={approverComboStore.filter(item => item.recordId === approverValidation.values.codeId)[0]}
    required
    onChange={(event, newValue) => {
      approverValidation.setFieldValue('codeId', newValue?.recordId)
    }}
    error={approverValidation.touched.codeId && Boolean(approverValidation.errors.codeId)}
    helperText={approverValidation.touched.codeId && approverValidation.errors.codeId}
    maxAccess={maxAccess}
  />
</Grid> */}
{/* <GridToolbar onAdd={addApprover} maxAccess={maxAccess} />
<Table
  columns={columns}
  gridData={approverGridData}
  rowId={['codeId']}
  api={getApproverGridData}
  onEdit={editApprover}
  onDelete={delApprover}
  isLoading={false}
  maxAccess={maxAccess}
  pagination={false}
  height={300}
/> */}

// const delApprover = obj => {
//   postRequest({
//     extension: DocumentReleaseRepository.GroupCode.del,
//     record: JSON.stringify(obj)
//   })
//     .then(res => {
//       toast.success('Record Deleted Successfully')
//       getApproverGridData(obj.groupId)
//     })
//     .catch(error => {
//       setErrorMessage(error)
//     })
// }

// const addApprover = () => {
//   approverValidation.setValues(getNewGroupCode(drGroupValidation.values.recordId))
//   setApproverWindowOpen(true)
// }

// const editApprover = obj => {
//   console.log(obj)
//   getApproverById(obj)
// }

