// ** React Importsport
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import TransactionLog from 'src/components/Shared/TransactionLog'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { CommonContext } from 'src/providers/CommonContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getNewBPMasterData, populateBPMasterData } from 'src/Models/BusinessPartner/BPMasterData'
import { getNewRelation, populateRelation } from 'src/Models/BusinessPartner/Relation'
import { getNewAddress, populateAddress } from 'src/Models/System/Address'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'
import { DataSets } from 'src/resources/DataSets'

// ** Windows
import BPMasterDataWindow from './Windows/BPMasterDataWindow'
import BPRelationWindow from './Windows/BPRelationWindow'
import AddressWindow from 'src/components/Shared/AddressWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'

const BPMasterData = () => {
  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  //control
  const [labels, setLabels] = useState(null)
  const [addressLabels, setAddressLabels] = useState(null)
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

  const [addressGridData, setAddressGridData] = useState([]) //for address tab
  const [cityStore, setCityStore] = useState([])
  const [cityDistrictStore, setCityDistrictStore] = useState([])
  const [stateStore, setStateStore] = useState([])

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [defaultValue, setdefaultValue] = useState(null)
  const [windowInfo, setWindowInfo] = useState(null)

  const [relationWindowOpen, setRelationWindowOpen] = useState(false)

  const [addressWindowOpen, setAddressWindowOpen] = useState(false)
  const [addressEditMode, setAddressEditMode] = useState(false)

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
    to: labels && labels.find(item => item.key === 24).value,

    name:
      addressLabels && addressLabels.find(item => item.key === 1) && addressLabels.find(item => item.key === 1).value,
    street1:
      addressLabels && addressLabels.find(item => item.key === 2) && addressLabels.find(item => item.key === 2).value,
    street2:
      addressLabels && addressLabels.find(item => item.key === 3) && addressLabels.find(item => item.key === 3).value,
    email:
      addressLabels && addressLabels.find(item => item.key === 4) && addressLabels.find(item => item.key === 4).value,
    email2:
      addressLabels && addressLabels.find(item => item.key === 5) && addressLabels.find(item => item.key === 5).value,

    country:
      addressLabels && addressLabels.find(item => item.key === 6) && addressLabels.find(item => item.key === 6).value,
    state:
      addressLabels && addressLabels.find(item => item.key === 7) && addressLabels.find(item => item.key === 7).value,
    city:
      addressLabels && addressLabels.find(item => item.key === 8) && addressLabels.find(item => item.key === 8).value,

    postalCode:
      addressLabels && addressLabels.find(item => item.key === 9) && addressLabels.find(item => item.key === 9).value,
    phone:
      addressLabels && addressLabels.find(item => item.key === 10) && addressLabels.find(item => item.key === 10).value,
    phone2:
      addressLabels && addressLabels.find(item => item.key === 11) && addressLabels.find(item => item.key === 11).value,
    phone3:
      addressLabels && addressLabels.find(item => item.key === 12) && addressLabels.find(item => item.key === 12).value,
    address:
      addressLabels && addressLabels.find(item => item.key === 13) && addressLabels.find(item => item.key === 13).value,

    cityDistrict:
      addressLabels && addressLabels.find(item => item.key === 14) && addressLabels.find(item => item.key === 14).value,
    bldgNo:
      addressLabels && addressLabels.find(item => item.key === 15) && addressLabels.find(item => item.key === 15).value,
    unitNo:
      addressLabels && addressLabels.find(item => item.key === 16) && addressLabels.find(item => item.key === 16).value,
    subNo:
      addressLabels && addressLabels.find(item => item.key === 17) && addressLabels.find(item => item.key === 17).value
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

  const tabs = [{ label: _labels.general }, { label: _labels.idNumber, disabled: !editMode }, { label: _labels.relation, disabled: !editMode },
    { label: _labels.address , disabled: !editMode }]

  const bpMasterDataValidation = useFormik({
    enableReinitialize: true,
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

    //didn't mention address because it is not affected by submit button
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
        fillRelationComboStore()
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
    setdefaultValue(null)

    //address
    setAddressGridData([]) //state store will be filled upon country selection
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
        fillGroupStore()
        fillIdCategoryStore(res.record.category)
        fillCategoryStore()
        fillCountryStore()
        filllegalStatusStore()
        resetIdNumber(res.record.recordId)
        fillIdNumberStore(obj)
        getRelationGridData(obj.recordId)
        fillRelationComboStore()
        setdefaultValue(null)
        if (obj.defaultInc != null){getDefault(obj)}
        setEditMode(true)
        setWindowOpen(true)
        setActiveTab(0)

        //address
        getAddressGridData(obj.recordId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillCategoryStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.BP_CATEGORY,
      callback: setCategoryStore
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

  const fillCountryStore = () => { //used for 2 tabs
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

  const getDefault = obj => {
    const bpId = obj.recordId
    const incId = obj.defaultInc
    var parameters =`_bpId=${bpId}&_incId=${incId}`

    getRequest({
      extension: BusinessPartnerRepository.MasterIDNum.get,
      parameters: parameters
    })
    .then(res => {
      if (res.record && res.record.idNum != null) {
        setdefaultValue(res.record.idNum)
      }
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
      relationId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log('relation values '+ JSON.stringify(values))
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
    obj.fromBPId=bpId
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
        console.log('get '+JSON.stringify())
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
    const bpId = obj.bpId  ? obj.bpId : bpMasterDataValidation.values.recordId
    postRequest({
      extension: BusinessPartnerRepository.Relation.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getRelationGridData(bpId)
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
        getLabels(ResourceIds.Address, setAddressLabels)
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


  // Address Tab

  const addressValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required'),
      stateId: yup.string().required('This field is required'),
      street1: yup.string().required('This field is required'),
      phone: yup.string().required('This field is required'),
      cityId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log('addressVal:')
      console.log(values)
      postAddress(values)
    }
  })

  const postAddress = obj => {
    console.log(obj)
    const bpId = bpMasterDataValidation.values.recordId
    postRequest({
      extension: SystemRepository.Address.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        console.log(res.recordId)
        obj.recordId = res.recordId
        addressValidation.setFieldValue('recordId', obj.recordId)
        setAddressWindowOpen(false)

        //post BPAddress
        const object = obj //we add bill to and ship to to validation
        object.addressId = addressValidation.values.recordId
        object.bpId = bpId
        console.log('object')
        console.log(object)
        postRequest({
          extension: BusinessPartnerRepository.BPAddress.set,
          record: JSON.stringify(object)
        })
        .then(bpResponse => {
          getAddressGridData(bpId)
         })
        .catch(error => {
          setErrorMessage(error)
        })

        //bill to and ship to are with formik (hidden or not from security grps)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getAddressGridData = bpId => {
    setAddressGridData([])
    const defaultParams = `_bpId=${bpId}`
    var parameters = defaultParams
    getRequest({
      extension: BusinessPartnerRepository.BPAddress.qry,
      parameters: parameters
    })
      .then(res => {
        console.log('grid')
        console.log(res) //address is complex object so data are not appearing in grid setAddressGridData(res).. should find solution
        res.list = res.list.map((row) => row = row.address) //sol
        console.log(res)
        setAddressGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delAddress = obj => { //talk about problem of getting only address body: create empty object or keep this full body??
    console.log(obj)
    const bpId = bpMasterDataValidation.values.recordId
    obj.bpId =  bpId
    obj.addressId = obj.recordId
    console.log(obj)
    postRequest({
      extension: BusinessPartnerRepository.BPAddress.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getAddressGridData(bpId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addAddress = () => {
    addressValidation.setValues(getNewAddress) //bpId is then added to object on save..
    setAddressWindowOpen(true)
  }

  const editAddress = obj => {
    console.log(obj)
    getAddressById(obj)
  }

   const getAddressById = obj => {
    const _bpId = bpMasterDataValidation.values.recordId

    const defaultParams = `_recordId=${obj.recordId}`//addressId the object i am getting was the bpAddress
    // after modifying list it is normal address so i send obj.recordId
    const bpAddressDefaultParams =  `_addressId=${obj.recordId}&_bpId=${_bpId}`
    var parameters = defaultParams
    getRequest({
      extension: SystemRepository.Address.get,
      parameters: parameters
    })
      .then(res => {
        console.log(res.record)
        addressValidation.setValues(populateAddress(res.record))
        setAddressEditMode(true)
        setAddressWindowOpen(true)

        getRequest({
          extension: BusinessPartnerRepository.BPAddress.get,
          parameters: bpAddressDefaultParams
        })
          .then(res => {
            console.log(res.record)

            //addressValidation.setValues(populateAddress(res.record)) put in address validation shipto and billto
            //buttons
          })
          .catch(error => {
            setErrorMessage(error)
          })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleAddressSubmit = () => {
    addressValidation.handleSubmit()
  }


  const fillStateStore = countryId => {
    setStateStore([])
    var parameters = `_countryId=${countryId}`
    if (countryId) {
      getRequest({
        extension: SystemRepository.State.qry,
        parameters: parameters
      })
        .then(res => {
          setStateStore(res.list)
        })
        .catch(error => {
          setErrorMessage(error)
        })
    }
  }

  const lookupCity = searchQry => {
    setCityStore([])
    if (!addressValidation.values.countryId)
    {
      console.log('false')

     return false
    }
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}&_countryId=${addressValidation.values.countryId}&_stateId=${addressValidation.values.stateId}`
    getRequest({
      extension: SystemRepository.City.snapshot,
      parameters: parameters
    })
      .then(res => {
        console.log(res.list)
        setCityStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const lookupCityDistrict = searchQry => {
    setCityDistrictStore([])
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}&_cityId=${addressValidation.values.cityId}`

    getRequest({
      extension: SystemRepository.CityDistrict.snapshot,
      parameters: parameters
    })
      .then(res => {
        console.log(res.list)
        setCityDistrictStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

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
          onInfo={()=>{setWindowInfo(true)}}
          onInfoClose={()=>{setWindowInfo(false)}}
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
          defaultValue={defaultValue}

          //ID Number Tab
          idNumberGridColumn={idNumberGridColumn}
          idNumberValidation={idNumberValidation}

          //Relation Tab
          relationGridData={relationGridData}
          getRelationGridData={getRelationGridData}
          delRelation={delRelation}
          addRelation={addRelation}
          popupRelation={popupRelation}

          //Address tab (grid)
          addressGridData={addressGridData}
          getAddressGridData={getAddressGridData}
          addAddress={addAddress}
          delAddress={delAddress}
          editAddress={editAddress}
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
      {addressWindowOpen && (
        <AddressWindow
          onClose={() => setAddressWindowOpen(false)}
          onSave={handleAddressSubmit}
          addressValidation={addressValidation}
          countryStore={countryStore}
          stateStore={stateStore}
          fillStateStore={fillStateStore}
          cityStore={cityStore}
          setCityStore={setCityStore}
          lookupCity={lookupCity}
          cityDistrictStore={cityDistrictStore}
          setCityDistrictStore={setCityDistrictStore}
          lookupCityDistrict={lookupCityDistrict}

          //approverComboStore={approverComboStore.list} why list?
          maxAccess={access}
          labels={_labels}
          width ={600}
          height={400}
        />
      )}
             {windowInfo && <TransactionLog  resourceId={ResourceIds && ResourceIds.BPMasterData}  onInfoClose={() => setWindowInfo(false)} recordId={bpMasterDataValidation.values.recordId}/>}

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default BPMasterData
