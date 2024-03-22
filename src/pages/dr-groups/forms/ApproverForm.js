// ** React Imports
import { useState, useContext } from 'react'
import { useFormik } from 'formik'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'

// ** MUI Imports
import {Box } from '@mui/material'
import toast from 'react-hot-toast'
import { DocumentReleaseRepository} from 'src/repositories/DocumentReleaseRepository'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

// ** Windows

// ** Helpers
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const ApproverForm = ({store}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const {recordId}= store
  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: DocumentReleaseRepository.GroupCode.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_groupId=${recordId}`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: DocumentReleaseRepository.GroupCode.qry,
    datasetId: ResourceIds.DRGroups
  })



  const columns = [
    {
      field: 'codeRef',
      headerName: _labels.reference,
      flex: 1
    },
  ]


  const addApprover = () => {
    openForm2()
  }

  const editApprover = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
  }

  const delApprover = async obj => {
    openForm2()
  }

  function openForm2 (recordId){
    stack({
      Component: ApproverWindow,
      props: {
        labels: _labels,
        recordId: recordId? recordId : null,
      },
      width: 1200,
      height: 600,
      title: _labels.apprrover
    })
  }


  const ApproverWindow = ({
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
      endpointId: DocumentReleaseRepository.DRGroup.qry
    })
  
    const [initialValues , setInitialData] = useState({
      recordId: null,
      name: null,
      reference: null,
   
    })
  
    const formik = useFormik({
      enableReinitialize: true,
      validateOnChange: true,
      initialValues,
      validationSchema: yup.object({
        reference: yup.string().required('This field is required'),
        name: yup.string().required('This field is required'),
       
      }),
      onSubmit: values => {
        postGroups(values)
      }
    })
  
    const postGroups = async obj => {
      const isNewRecord = !obj?.recordId;
      try {
        const res = await postRequest({
          extension: DocumentReleaseRepository.DRGroup.set,
          record: JSON.stringify(obj)
        });
        
        if (isNewRecord) {
          toast.success('Record Added Successfully');
          setInitialData(prevData => ({
            ...prevData,
            ...obj,
            recordId: res.recordId 
          }));
          setEditMode(true); 
          invalidate(); 
        } else {
          toast.success('Record Edited Successfully');
          setInitialData(prevData => ({
            ...prevData,
            ...obj
          }));
          invalidate();
        }
      } catch (error) {
       
        toast.error('An error occurred');
      }
    };
   useEffect(() => {
    recordId && getGroupId(recordId);
  }, [recordId]);
  
    const getGroupId = recordId => {
      const defaultParams = `_recordId=${recordId}`;
      var parameters = defaultParams;
      getRequest({
        extension: DocumentReleaseRepository.DRGroup.get,
        parameters: parameters
      })
        .then(res => {
          setInitialData(res.record); // This is where you expect setInitialData to be called.
          setEditMode(true);
        })
        .catch(error => {
          // Handle your error here
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
          <res
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
     
        </Grid>
  
          
      </FormShell>
    )
  }
  
  

  return (
  
    <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}
  >

    <GridToolbar onAdd={addApprover} maxAccess={access} />
    <Table
      columns={columns}
      gridData={data}
      rowId={['codeId']}
      isLoading={false}
      pageSize={50}
      paginationType='client'
      onEdit={editApprover}
      onDelete={delApprover}
      maxAccess={access}      
      height={300}
    />
  </Box>
      
  )
}

export default ApproverForm


  

//   </>
//   );
// };





// const ApproverTab = ({ approverGridData, getApproverGridData, addApprover, delApprover, editApprover, maxAccess, _labels }) => {}

  