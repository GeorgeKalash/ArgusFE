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
import { getNewRelation, populateRelation } from 'src/Models/BusinessPartner/Relation'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'

// ** Windows
import BPMasterDataWindow from './Windows/BPMasterDataWindow'
import BPRelationWindow from './Windows/BPRelationWindow'

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
  const [countryStore, setCountryStore] = useState([])
  const [legalStatusStore, setLegalStatusStore] = useState([])
  const [relationGridData, setRelationGridData] = useState([])
  const [relationStore, setRelationStore] = useState([])
  const [businessPartnerStore, setBusinessPartnerStore] = useState([])
  
  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const [relationWindowOpen, setRelationWindowOpen] = useState(false)

  const _labels = {
    general: labels && labels.find(item => item.key === 1).value,
    group: labels && labels.find(item => item.key === 2).value,
    reference: labels && labels.find(item => item.key === 3).value,
    name: labels && labels.find(item => item.key === 4).value,
    foreignLanguage: labels && labels.find(item => item.key === 5).value,
    keywords: labels && labels.find(item => item.key === 6).value,
    idCategory: labels && labels.find(item => item.key === 7).value,
    defaultId: labels && labels.find(item => item.key === 8).value,
    inactive: labels && labels.find(item => item.key === 9).value,
    masterData: labels && labels.find(item => item.key === 10).value,
    category: labels && labels.find(item => item.key === 11).value,
    birthPlace: labels && labels.find(item => item.key === 12).value,
    isBlackListed: labels && labels.find(item => item.key === 13).value,
    nationalityRef: labels && labels.find(item => item.key === 14).value,
    nationalityName: labels && labels.find(item => item.key === 15).value,
    birthDate: labels && labels.find(item => item.key === 16).value,
    nationalityId: labels && labels.find(item => item.key === 17).value,
    legalStatus: labels && labels.find(item => item.key === 18).value,
    idCategory: labels && labels.find(item => item.key === 19).value,
    idNumber: labels && labels.find(item => item.key === 20).value,
    relation: labels && labels.find(item => item.key === 21).value,
    businessPartner: labels && labels.find(item => item.key === 22).value,
    from: labels && labels.find(item => item.key === 23).value,
    to: labels && labels.find(item => item.key === 24).value
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
    },
    {
      field: 'nationalityRef',
      headerName: _labels.nationalityRef,
      flex: 1
    },
    {
      field: 'nationalityName',
      headerName: _labels.nationalityName,
      flex: 1
    },
    {
      field: 'legalStatus',
      headerName: _labels.legalStatus,
      flex: 1
    }
  ]

  const tabs = [{ label: _labels.general }, { label: _labels.idNumber, disabled: !editMode }, { label: _labels.relation, disabled: !editMode }]

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
      postBPMasterData(values)
    }
  })

  const handleSubmit = () => {
    if (activeTab === 0) bpMasterDataValidation.handleSubmit()
    else if (activeTab === 1) idNumberValidation.handleSubmit()
    else if (activeTab === 2) relationGridData.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=&_sortBy=reference desc`
    var parameters = defaultParams

    getRequest({
      extension: BusinessPartnerRepository.MasterData.qry,
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
      extension: BusinessPartnerRepository.MasterData.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setEditMode(true)
        resetIdNumber(res.recordId)
        obj.recordId = res.recordId
        fillIdNumberStore(obj)
        getRelationGridData(obj.recordId)
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
      extension: BusinessPartnerRepository.MasterData.del,
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
    fillIdCategoryStore(null)
    fillCategoryStore()
    fillCountryStore()
    filllegalStatusStore()
    resetIdNumber()
    setRelationGridData([])
  }

  const editBPMasterData = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: BusinessPartnerRepository.MasterData.get,
      parameters: parameters
    })
      .then(res => {
        bpMasterDataValidation.setValues(populateBPMasterData(res.record))
        console.log(populateBPMasterData(res.record))
        fillGroupStore()
        fillIdCategoryStore(res.record.category)
        fillCategoryStore()
        fillCountryStore()
        filllegalStatusStore()
        resetIdNumber(res.record.recordId)
        fillIdNumberStore(obj)
        getRelationGridData(obj.recordId)
        fillRelationComboStore()
        setEditMode(true)
        setWindowOpen(true)
        setActiveTab(0)
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
        setGroupStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillIdCategoryStore = async categId => {
    setIDCategoryStore([])
    const list = await filterIdCategory(categId)
    setIDCategoryStore(list)
  }

  const filterIdCategory = async categId => {
    try {
      var parameters = `_startAt=0&_pageSize=1000`

      const res = await getRequest({
        extension: BusinessPartnerRepository.CategoryID.qry,
        parameters: parameters
      })

      var filteredList = []
      if (categId != null) {
        res.list.forEach(item => {
          if (categId === 1 && item.person) {
            filteredList.push(item)
          }
          if (categId === 2 && item.org) {
            filteredList.push(item)
          }
          if (categId === 3 && item.group) {
            filteredList.push(item)
          }
        })
      }

      return filteredList
    } catch (error) {
      setErrorMessage(error.res)

      return []
    }
  }

  const fillCountryStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Country.qry,
      parameters: parameters
    })
      .then(res => {
        setCountryStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const filllegalStatusStore = () => {
    const defaultParams = `_startAt=0&_pageSize=100`
    var parameters = defaultParams
    getRequest({
      extension: BusinessPartnerRepository.LegalStatus.qry,
      parameters: parameters
    })
      .then(res => {
        setLegalStatusStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  // IDNumber TAB
  const idNumberGridColumn = [
    {
      field: 'textfield',
      header: _labels.idCategory,
      name: 'incName',
      readOnly: true
    },
    {
      id: 1,
      field: 'textfield',
      header: _labels.idNumber,
      name: 'idNum'
    }
  ]

  const idNumberValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
          bpId: bpMasterDataValidation.values
            ? bpMasterDataValidation.values.recordId
              ? bpMasterDataValidation.values.recordId
              : ''
            : '',
          incId: '',
          idNum: '',
          incName: ''
        }
      ]
    },
    onSubmit: values => {
      postIdNumber(values.rows)
    }
  })

  const postIdNumber = obj => {
    const recordId = bpMasterDataValidation.values.recordId

    const postBody = Object.entries(obj).map(([key, value]) => {
      return postRequest({
        extension: BusinessPartnerRepository.MasterIDNum.set,
        record: JSON.stringify(value)
      })
    })
    Promise.all(postBody)
      .then(() => {
        if (!recordId) {
          toast.success('Record Added Successfully')
        } else {
          toast.success('Record Edited Successfully')
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const resetIdNumber = id => {
    idNumberValidation.resetForm()
    idNumberValidation.setValues({
      rows: [
        {
          bpId: id ? id : bpMasterDataValidation.values ? bpMasterDataValidation.values.recordId : '',
          incId: '',
          incName: '',
          idNum: ''
        }
      ]
    })
  }

  const fillIdNumberStore = async obj => {
    try {
      console.log(obj.recordId)
      const _recordId = obj.recordId
      const defaultParams = `_bpId=${_recordId}`
      var parameters = defaultParams

      const res = await getRequest({
        extension: BusinessPartnerRepository.MasterIDNum.qry,
        parameters: parameters
      })
      const list = await filterIdCategory(obj.category)

      var listMIN = res.list.filter(y => {
        return list.some(x => x.name === y.incName)
      })

      if (listMIN.length > 0) {
        idNumberValidation.setValues({ rows: listMIN })
      } else {
        idNumberValidation.setValues({
          rows: [
            {
              bpId: _recordId,
              incId: '',
              incName: '',
              idNum: ''
            }
          ]
        })
      }
    } catch (error) {
      setErrorMessage(error)
    }
  }

  //Relation Tab
  const relationValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      toBPId: yup.string().required('This field is required'),
      toBPName: yup.string().required('This field is required'),
      relationId: yup.string().required('This field is required'),
      relationName: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postRelation(values)
    }
  })

  const addRelation = () => {
    relationValidation.setValues(getNewRelation(bpMasterDataValidation.values.recordId))
    setRelationWindowOpen(true)
  }

  const popupRelation = obj => {
    getRelationById(obj)
  }

  const getRelationGridData = bpId => {
    setRelationGridData([])
    const defaultParams = `_bpId=${bpId}`
    var parameters = defaultParams

    getRequest({
      extension: BusinessPartnerRepository.Relation.qry,
      parameters: parameters
    })
      .then(res => {
        setRelationGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postRelation = obj => {
    const recordId = obj.recordId
    const bpId = obj.bpId  ? obj.bpId : bpMasterDataValidation.values.recordId
    postRequest({
      extension: BusinessPartnerRepository.Relation.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!recordId) {
          toast.success('Record Added Successfully')
        }
        else toast.success('Record Editted Successfully')

        setRelationWindowOpen(false)
        getRelationGridData(bpId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getRelationById = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: BusinessPartnerRepository.Relation.get,
      parameters: parameters
    })
      .then(res => {
        relationValidation.setValues(populateRelation(res.record))
        setRelationWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleRelationSubmit = () => {
    relationValidation.handleSubmit()
  }

  const delRelation = obj => {
    postRequest({
      extension: BusinessPartnerRepository.Relation.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getRelationGridData(obj.recordId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillRelationComboStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: BusinessPartnerRepository.RelationTypes.qry,
      parameters: parameters
    })
      .then(res => {
        setRelationStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const lookupBusinessPartner = searchQry => {

    setBusinessPartnerStore([])
    if(searchQry){
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}`
    getRequest({
      extension: BusinessPartnerRepository.MasterData.snapshot,
      parameters: parameters
    })
      .then(res => {
        setBusinessPartnerStore(res.list)
      })
      .catch(error => {
         setErrorMessage(error)
      })}
  }
  useEffect(() => {
    if (!access) getAccess(ResourceIds.BPMasterData, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        getLabels(ResourceIds.BPMasterData, setLabels)
        fillGroupStore()
        fillCategoryStore()
        fillCountryStore()
        filllegalStatusStore()
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          width={800}
          height={400}
          tabs={tabs}
          onSave={handleSubmit}
          editMode={editMode}
          labels={_labels}
          maxAccess={access}
          activeTab={activeTab}
          setActiveTab={setActiveTab}

          //General Tab
          bpMasterDataValidation={bpMasterDataValidation}
          categoryStore={categoryStore}
          idCategoryStore={idCategoryStore}
          fillIdCategoryStore={fillIdCategoryStore}
          groupStore={groupStore}
          countryStore={countryStore}
          legalStatusStore={legalStatusStore}

          //ID Number Tab
          idNumberGridColumn={idNumberGridColumn}
          idNumberValidation={idNumberValidation}

          //Relation Tab
          relationGridData={relationGridData}
          getRelationGridData={getRelationGridData}
          delRelation={delRelation}
          addRelation={addRelation}
          popupRelation={popupRelation}
        />
      )}

       {relationWindowOpen && (
        <BPRelationWindow
          onClose={() => setRelationWindowOpen(false)}
          onSave={handleRelationSubmit}
          relationValidation={relationValidation}
          relationStore={relationStore}
          businessPartnerStore={businessPartnerStore}
          setBusinessPartnerStore={setBusinessPartnerStore}
          lookupBusinessPartner={lookupBusinessPartner}
          labels={_labels}
          maxAccess={access}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default BPMasterData
