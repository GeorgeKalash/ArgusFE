
// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

import FormShell from 'src/components/Shared/FormShell'
import { useFormik } from 'formik'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DocumentReleaseRepository} from 'src/repositories/DocumentReleaseRepository'
import { useInvalidate} from 'src/hooks/resource'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

const ApproverForm = ({
  labels,
  editMode,
  maxAccess,
  setEditMode,
  setStore,
  store
}) => {

  const { postRequest, getRequest} = useContext(RequestsContext)
  const {recordId} = store

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.GroupCode.qry
  })

  const [initialValues , setInitialData] = useState({
    recordId: null,
    codeId:''
 
  })

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues,
    validationSchema: yup.object({
      codeId: yup.string().required('This field is required'),
      
  
    }),
    onSubmit: values => {
      postGroups(values)
    }
  })

  const postGroups = obj => {
    const recordId = obj?.recordId || ''
    postRequest({
      extension:  DocumentReleaseRepository.GroupCode.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!recordId) {

            setEditMode(true)
            setStore(prevStore => ({
              ...prevStore,
              recordId: res.recordId
            }));
            toast.success('Record Added Successfully')

            formik.setFieldValue('recordId', res.recordId )
            invalidate()

        } else {
          toast.success('Record Editted Successfully')
        }
      })
      .catch(error => {
      })
  }

  useEffect(()=>{
    recordId  && getGroupId(recordId)
  },[recordId])

  const getGroupId =  recordId => {
    const defaultParams = `_recordId=${recordId}`
    var parameters = defaultParams
     getRequest({
      extension: DocumentReleaseRepository.GroupCode.get,
      parameters: parameters
    })
      .then(res => {
        formik.setValues(res.record)
        setEditMode(true)
      })
      .catch(error => {
      })
  }

return (
    <FormShell
    form={formik}
    resourceId={ResourceIds.DRGroups}
    maxAccess={maxAccess}
    editMode={editMode} >
     <Grid container spacing={4}>
      <Grid item xs={12}>
      <ResourceComboBox
              endpointId={DocumentReleaseRepository.GroupCode.qry}
              name='codeId'
              label={labels.group}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              required
              readOnly={editMode}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('groupId', newValue?.recordId)
              }}
        
            />
      </Grid>

      </Grid>

        
    </FormShell>
  )
}

export default ApproverForm


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
