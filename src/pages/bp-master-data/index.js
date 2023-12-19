// ** React Importsport
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Button, FormControlLabel } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getNewBPMasterData, populateBPMasterData } from 'src/Models/BusinessPartner/BPMasterData'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'

// ** Windows
import BPMasterDataWindow from './Windows/BPMasterDataWindow'

// ** Helpers
// import { getFormattedNumber, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { defaultParams } from 'src/lib/defaults'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

const BPMasterData = () => {
  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [categoryStore, setCategoryStore] = useState([])
  const [groupStore, setGroupStore] = useState([])
  const [idCategoryStore, setIDCategoryStore] = useState([])

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const _labels = {
    general: labels && labels.find(item => item.key === 1).value,
    category: labels && labels.find(item => item.key === 2).value,
    group: labels && labels.find(item => item.key === 3).value,
    reference: labels && labels.find(item => item.key === 4).value,
    name: labels && labels.find(item => item.key === 5).value,
    foreignLanguage: labels && labels.find(item => item.key === 6).value,
    keywords: labels && labels.find(item => item.key === 7).value,
    idCategory: labels && labels.find(item => item.key === 8).value,
    defaultId: labels && labels.find(item => item.key === 9).value,
    inactive: labels && labels.find(item => item.key === 10).value,
    masterData: labels && labels.find(item => item.key === 11).value
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'groupName',
      headerName: _labels.group,
      flex: 1
    },
    ,
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'flName',
      headerName: _labels.foreignLanguage,
      flex: 1
    }
  ]

  const tabs = [{ label: _labels.general }]

  const bpMasterDataValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      category: yup.string().required('This field is required'),
      groupId: yup.string().required('This field is required'),
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postIdTypes(values)
    }
  })

  const handleSubmit = () => {
    if (activeTab === 0) bpMasterDataValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams

    getRequest({
      extension: BusinessPartnerRepository.BPMasterData.page,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postBPMasterData = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: BusinessPartnerRepository.BPMasterData.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setEditMode(true)
        setWindowOpen(false)
        if (!recordId) {
          bpMasterDataValidation.setFieldValue('recordId', res.recordId)
          toast.success('Record Added Successfully')
        } else toast.success('Record Editted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delBPMasterData = obj => {
    postRequest({
      extension: BusinessPartnerRepository.BPMasterData.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addBPMasterData = () => {
    bpMasterDataValidation.setValues(getNewBPMasterData())
    setActiveTab(0)
    setEditMode(false)
    setWindowOpen(true)
    fillGroupStore()
    fillIdCategoryStore()
    fillCategoryStore()
  }

  const editBPMasterData = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: BusinessPartnerRepository.BPMasterData.get,
      parameters: parameters
    })
      .then(res => {
        bpMasterDataValidation.setValues(populateBPMasterData(res.record))
        setEditMode(true)
        setWindowOpen(true)
        setActiveTab(0)
        fillGroupStore()
        fillIdCategoryStore()
        fillCategoryStore()
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillCategoryStore = () => {
    var parameters = '_database=49' //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        //ask about lang values
        setCategoryStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillGroupStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: BusinessPartnerRepository.Group.qry,
      parameters: parameters
    })
      .then(res => {
        //ask about lang values
        setGroupStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillIdCategoryStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: BusinessPartnerRepository.CategoryID,
      parameters: parameters
    })
      .then(res => {
        //ask about lang values
        setIDCategoryStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.BPMasterData, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        getLabels(ResourceIds.BPMasterData, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  return (
    <>
      <Box>
        <GridToolbar onAdd={addBPMasterData} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editBPMasterData}
          onDelete={delBPMasterData}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <BPMasterDataWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          tabs={tabs}
          onSave={handleSubmit}
          editMode={editMode}
          bpMasterDataValidation={bpMasterDataValidation}
          categoryStore={categoryStore}
          idCategoryStore={idCategoryStore}
          groupStore={groupStore}
          labels={_labels}
          maxAccess={access}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default BPMasterData
