// ** React Importsport
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Button, Checkbox, FormControlLabel } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import {
  getNewGroupLegalDocument,
  populateGroupLegalDocument
} from 'src/Models/System/BusinessPartner/GroupLegalDocument'
import { getNewCategoryId, populateCategoryId } from 'src/Models/System/BusinessPartner/Group'
import { getNewGroup, populateGroup } from 'src/Models/System/BusinessPartner/CategoryID'

// ** Helpers
// import { getFormattedNumber, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { defaultParams } from 'src/lib/defaults'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

const GroupLegalDocument = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //stores
  const [gridData, setGridData] = useState([])
  const [categoryStore, setCategoryStore] = useState([])
  const [groupStore, setGroupStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const columns = [
    {
      field: 'groupName',
      headerName: 'Group Name ',
      flex: 1
    },
    {
      field: 'incName',
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

  const groupLegalDocumentValidation = useFormik({
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
    groupLegalDocumentValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 30 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams

    getRequest({
      extension: BusinessPartnerRepository.GroupLegalDocument.qryGIN,
      parameters: parameters
    })
      .then(res => {
        console.log('Response received:', res)
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const FillCategoryStore = () => {
    var parameters = `filter=`
    getRequest({
      extension: BusinessPartnerRepository.CategoryID.qryINC,
      parameters: parameters
    })
      .then(res => {
        setCategoryStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const FillGroupStore = () => {
    var parameters = `filter=`
    getRequest({
      extension: BusinessPartnerRepository.Group.qryGRP,
      parameters: parameters
    })
      .then(res => {
        setGroupStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const postGroupLegalDocument = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: BusinessPartnerRepository.GroupLegalDocument.setGIN,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setWindowOpen(false)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Editted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delGroupLegalDocument = obj => {
    console.log('jsonOBJ ' + JSON.stringify(obj))
    postRequest({
      extension: BusinessPartnerRepository.GroupLegalDocument.delGIN,
      record: JSON.stringify(obj)
    })
      .then(res => {
        console.log({ res })
        getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addGroupLegalDocument = () => {
    groupLegalDocumentValidation.setValues(getNewGroupLegalDocument())
    FillCategoryStore()
    FillGroupStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const editGroupLegalDocument = obj => {
    console.log(obj)
    groupLegalDocumentValidation.setValues(populateGroupLegalDocument(obj))
    FillCategoryStore()
    FillGroupStore()
    setEditMode(true)
    setWindowOpen(true)
  }
  useEffect(() => {
    getGridData({ _startAt: 0, _pageSize: 30 })
    FillGroupStore()
    FillCategoryStore()
  })

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
                <CustomComboBox
                  name='groupId'
                  label='Group Name'
                  valueField='recordId'
                  displayField='name'
                  store={groupStore}
                  value={groupLegalDocumentValidation.values.groupName}
                  required
                  readOnly={editMode}
                  onChange={(event, newValue) => {
                    groupLegalDocumentValidation.setFieldValue('groupId', newValue?.recordId)
                    groupLegalDocumentValidation.setFieldValue('groupName', newValue?.name)
                  }}
                  error={
                    groupLegalDocumentValidation.touched.groupName &&
                    Boolean(groupLegalDocumentValidation.errors.groupName)
                  }
                  helperText={
                    groupLegalDocumentValidation.touched.groupName && groupLegalDocumentValidation.errors.groupName
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='incId'
                  label='Category ID'
                  valueField='recordId'
                  displayField='name'
                  store={categoryStore}
                  value={groupLegalDocumentValidation.values.incName}
                  required
                  readOnly={editMode}
                  onChange={(event, newValue) => {
                    groupLegalDocumentValidation.setFieldValue('incId', newValue?.recordId)
                    groupLegalDocumentValidation.setFieldValue('incName', newValue?.name)
                  }}
                  error={
                    groupLegalDocumentValidation.touched.incName && Boolean(groupLegalDocumentValidation.errors.incName)
                  }
                  helperText={
                    groupLegalDocumentValidation.touched.incName && groupLegalDocumentValidation.errors.incName
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='required'
                      checked={groupLegalDocumentValidation.values?.required}
                      onChange={groupLegalDocumentValidation.handleChange}
                    />
                  }
                  label='Required'
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='mandatory'
                      checked={groupLegalDocumentValidation.values?.mandatory}
                      onChange={groupLegalDocumentValidation.handleChange}
                    />
                  }
                  label='Mandatory'
                />
              </Grid>
            </Grid>
          </CustomTabPanel>
        </Window>
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default GroupLegalDocument
