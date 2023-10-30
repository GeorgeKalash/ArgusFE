// ** React Importsport
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box} from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** Windows
import GroupLegalDocumentWindow from './Windows/GroupLegalDocumentWindow'

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
import { ResourceIds } from 'src/resources/ResourceIds'
import { KVSRepository } from 'src/repositories/KVSRepository'

const GroupLegalDocument = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //stores
  const [gridData, setGridData] = useState([])
  const [categoryStore, setCategoryStore] = useState([])
  const [groupStore, setGroupStore] = useState([])

  //states
  const [labels, setLabels] = useState(null)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const _labels = {
    group: labels && labels.find(item => item.key === 1).value,
    categoryId: labels && labels.find(item => item.key === 2).value,
    required: labels && labels.find(item => item.key === 3).value,
    mandatory: labels && labels.find(item => item.key === 4).value,
    groupLegalDocument: labels && labels.find(item => item.key === 5).value
  }

  const columns = [
    {
      field: 'groupName',
      headerName: _labels.group,
      flex: 1
    },
    {
      field: 'incName',
      headerName: _labels.categoryId,
      flex: 1
    },
    {
      field: 'required',
      headerName: _labels.required,
      flex: 1
    },
    {
      field: 'mandatory',
      headerName: _labels.mandatory,
      flex: 1
    }
  ]

  const groupLegalDocumentValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      groupId: yup.string().required('This field is required'),
      incId: yup.string().required('This field is required'),
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

  const getLabels = () => {
    var parameters = '_dataset=' + ResourceIds.GroupLegalDocument

    getRequest({
      extension: KVSRepository.getLabels,
      parameters: parameters
    })
      .then(res => {
        console.log({ res })
        setLabels(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams

    getRequest({
      extension: BusinessPartnerRepository.GroupLegalDocument.qry,
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

  const fillCategoryStore = () => {
    var parameters = `filter=`
    getRequest({
      extension: BusinessPartnerRepository.CategoryID.qry,
      parameters: parameters
    })
      .then(res => {
        setCategoryStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillGroupStore = () => {
    var parameters = `filter=`
    getRequest({
      extension: BusinessPartnerRepository.Group.qry,
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
      extension: BusinessPartnerRepository.GroupLegalDocument.set,
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
      extension: BusinessPartnerRepository.GroupLegalDocument.del,
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
    groupLegalDocumentValidation.setValues(getNewGroupLegalDocument)
    fillCategoryStore()
    fillGroupStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const editGroupLegalDocument = obj => {
    console.log(obj)
    groupLegalDocumentValidation.setValues(populateGroupLegalDocument(obj))
    fillCategoryStore()
    fillGroupStore()
    setEditMode(true)
    setWindowOpen(true)
  }
  useEffect(() => {
    getGridData({ _startAt: 0, _pageSize: 50 })
    fillGroupStore()
    fillCategoryStore()
    getLabels()
  },[])
  
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
        <GroupLegalDocumentWindow
          labels={_labels}
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          editMode={editMode}
          onSave={handleSubmit}
          groupLegalDocumentValidation={groupLegalDocumentValidation}
          categoryStore={categoryStore}
          groupStore={groupStore}
        />
      )}

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default GroupLegalDocument
