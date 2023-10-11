// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Button } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { getNewGroupLegalDocument, populateGroupLegalDocument } from 'src/Models/System/GroupLegalDocument'
// ** Helpers
// import { getFormattedNumber, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { defaultParams } from 'src/lib/defaults'

const GroupLegalDocument = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //stores
  const [gridData, setGridData] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const columns = [
    {
      field: 'groupName ',
      headerName: 'Group Name ',
      flex: 1
    },
    {
      field: 'incName ',
      headerName: 'Inc Name ',
      flex: 1
    },
    {
      field: 'required',
      headerName: 'Required',
      flex: 1
    },
    {
      field: 'mandatory',
      headerName: 'Mandatory',
      flex: 1
    }
  ]

  const GroupLegalDocumentValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,

    validationSchema: yup.object({
      groupName: yup.string().required('This field is required'),
      incName: yup.string().required('This field is required'),
      required: yup.string().required('This field is required'),
      mandatory: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postGroupLegalDocument(values)
    }
  })
  const handleSubmit = () => {
    GroupLegalDocumentValidation.handleSubmit()
  }
  const getGridData = ({ _startAt = 0, _pageSize = 30 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams

    // var parameters = defaultParams + '&_dgId=0'
    getRequest({
      extension: BusinessPartnerRepository.qryGIN,
      parameters: parameters
    })
      .then(res => {
        console.log('Response received:', res)
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        console.error('Error occurred:', error)
        console.log('Error response data:', error.response ? error.response.data : null)
      })
  }
  const postGroupLegalDocument = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: BusinessPartnerRepository.setGIN,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData()
        setWindowOpen(false)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Editted Successfully')
      })
      .catch(error => {
        console.log({ error: error })
      })
  }
  const delGroupLegalDocument = obj => {
    postRequest({
      extension: BusinessPartnerRepository.delGIN,
      record: JSON.stringify(obj)
    })
      .then(res => {
        console.log({ res })
        getGridData()
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        console.log({ error: error })
      })
  }

  const addGroupLegalDocument = () => {
    GroupLegalDocumentValidation.setValues(getNewGroupLegalDocument())
    setEditMode(false)
    setWindowOpen(true)
  }

  const editGroupLegalDocument = obj => {
    GroupLegalDocumentValidation.setValues(populateGroupLegalDocument(obj))
    setEditMode(true)
    setWindowOpen(true)
  }
  useEffect(() => {
    getGridData({ _startAt: 0, _pageSize: 30 })
  }, [])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar onAdd={addGroupLegalDocument} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['groupId', 'incId']}
          api={getGridData}
          onEdit={editGroupLegalDocument}
          onDelete={delGroupLegalDocument}
          isLoading={false}
        />
      </Box>
      {windowOpen && (
        <Window
          id='GroupLegalDocumentWindow'
          Title='Group Legal Document'
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          onSave={handleSubmit}
        >
          <CustomTabPanel>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <CustomTextField
                  name='groupName'
                  label='groupName'
                  value={GroupLegalDocumentValidation.values.groupName}
                  required
                  onChange={GroupLegalDocumentValidation.handleChange}
                  onClear={() => GroupLegalDocumentValidation.setFieldValue('groupName', '')}
                  error={
                    GroupLegalDocumentValidation.touched.groupName &&
                    Boolean(GroupLegalDocumentValidation.errors.groupName)
                  }
                  helperText={
                    GroupLegalDocumentValidation.touched.groupName && GroupLegalDocumentValidation.errors.groupName
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='incName'
                  label='incName'
                  value={GroupLegalDocumentValidation.values.incName}
                  required
                  onChange={GroupLegalDocumentValidation.handleChange}
                  onClear={() => GroupLegalDocumentValidation.setFieldValue('incName', '')}
                  error={
                    GroupLegalDocumentValidation.touched.incName && Boolean(GroupLegalDocumentValidation.errors.incName)
                  }
                  helperText={
                    GroupLegalDocumentValidation.touched.incName && GroupLegalDocumentValidation.errors.incName
                  }
                />
              </Grid>
            </Grid>
          </CustomTabPanel>
        </Window>
      )}
    </>
  )
}

export default GroupLegalDocument
