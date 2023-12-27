// ** React Imports
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
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getNewPlant, populatePlant } from 'src/Models/System/Plant'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import PlantWindow from './Windows/PlantWindow'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

const Plants = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //controls
  const [labels, setLabels] = useState(null)
  const [addressLabels, setAddressLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [costCenterStore, setCostCenterStore] = useState([])
  const [plantGroupStore, setPlantGroupStore] = useState([])
  const [segmentStore, setSegmentStore] = useState([])

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [countryStore, setCountryStore] = useState([])
  const [cityStore, setCityStore] = useState([])
  const [cityDistrictStore, setCityDistrictStore] = useState([])
  const [stateStore, setStateStore] = useState([])
  const [record, setRecord] = useState(null)

  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    licenseNo: labels && labels.find(item => item.key === 3).value,
    commReg: labels && labels.find(item => item.key === 4).value,
    costCenter: labels && labels.find(item => item.key === 5).value,
    plantGrp: labels && labels.find(item => item.key === 6).value,
    segment: labels && labels.find(item => item.key === 7).value,
    plant: labels && labels.find(item => item.key === 8).value,

    addName:
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
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'costCenterName',
      headerName: _labels.costCenter,
      flex: 1
    }
  ]

  const plantValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log(values)
      postPlant(values)
    }
  })

  const handleSubmit = () => {
    plantValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: SystemRepository.Plant.page,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
        console.log(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postPlant = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.Plant.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})

        plantValidation.setFieldValue('recordId', res.recordId)

        //setWindowOpen(false)
        setRecord(res.recordId)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delPlant = obj => {
    postRequest({
      extension: SystemRepository.Plant.del,
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

  const addPlant = () => {
    setRecord(0)
    setActiveTab(0)
    plantValidation.setValues({})
    plantValidation.setValues(getNewPlant)
    fillCostCenterStore()
    fillPlantGroupStore()
    fillSegmentStore()
    setEditMode(false)
    setWindowOpen(true)

    //CHECK WHEN TO EMPTY VALIDATION SECOND TAB
  }

  const editPlant = obj => {
    setActiveTab(0)
    fillCostCenterStore()
    fillPlantGroupStore()
    fillSegmentStore()

    var parameters = `_filter=` + '&_recordId=' + obj.addressId
    var object = obj
    setRecord(0)
    if (obj.addressId) {
      getRequest({
        extension: SystemRepository.Address.get,
        parameters: parameters
      })
        .then(res => {
          var result = res.record
          console.log(result)

          object.addName = result.name
          object.street1 = result.street1
          object.street2 = result.street2
          object.email1 = result.email1
          object.email2 = result.email2
          object.countryId = result.countryId
          object.stateName = result.stateName
          object.cityId = result.cityId
          object.cityName = result.city
          object.stateId = result.stateId
          object.phone = result.phone
          object.phone1 = result.phone1
          object.phone2 = result.phone2
          object.postalCode = result.postalCode
          object.cityDistrictId = result.cityDistrictId
          object.cityDistrictName = result.cityDistrict
          object.bldgNo = result.bldgNo
          object.unitNo = result.unitNo
          object.subNo = result.subNo

          fillStateStore(object.countryId)
          getPlantById(object)

        })
        .catch(error => {})
    } else {
      getPlantById(obj)
    }
  }

  const getPlantById = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: SystemRepository.Plant.get,
      parameters: parameters
    })
      .then(res => {
        plantValidation.setValues(populatePlant(res.record))
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.Plants, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })
        fillCostCenterStore()
        fillPlantGroupStore()
        fillSegmentStore()
        getLabels(ResourceIds.Plants, setLabels)
        getLabels(ResourceIds.Address, setAddressLabels)

        //fillCountryStore() on edit
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const fillCostCenterStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: GeneralLedgerRepository.CostCenter.qry,
      parameters: parameters
    })
      .then(res => {
        setCostCenterStore(res.list)
        console.log(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillPlantGroupStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.PlantGroup.qry,
      parameters: parameters
    })
      .then(res => {
        setPlantGroupStore(res.list)
        console.log(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillSegmentStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: FinancialRepository.Segment.qry,
      parameters: parameters
    })
      .then(res => {
        setSegmentStore(res.list)
        console.log(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  // ADDRESS TAB

  const tabs = [{ label: _labels.plant }, { label: _labels.address }]

  const addressValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      addName: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required'),
      stateId: yup.string().required('This field is required'),
      street1: yup.string().required('This field is required'),
      phone: yup.string().required('This field is required'),
      cityId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log(values)
      postAddress(values)
    }
  })

  const postAddress = obj => {
    console.log(obj)

    //const object = obj

    //plantValidation.values.recordId
    // 2 options either same validation or get first tab again

    //obj.recordId = obj.addressId > 0 ? obj.addressId : obj.recordId

    postRequest({
      extension: SystemRepository.Address.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        obj.addressId = res.addressId > 0 ? res.addressId : res.recordId
        plantValidation.setFieldValue('addressId',  obj.addressId )
        setRecord(0)
        
        //setWindowOpen(false)
        //updatePlantAdd()

       /* postRequest({
          extension: RemittanceSettingsRepository.CorrespondentAgentBranches.set,
          record: JSON.stringify(object)
        })
          .then(res => {
            getGridData({})
            setWindowOpen(false)
            setRecord(0)
            if (!res.recordId) toast.success('Record Added Successfully')
            else toast.success('Record Editted Successfully')
          })
          .catch(error => {
            setErrorMessage(error)
          }) */
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

 /* const updatePlantAdd = () => {
    const _recordId = plantValidation.values.recordId //always gives value?
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: SystemRepository.Plant.get,
      parameters: parameters
    })
      .then(res => {
        plantValidation.setValues(populatePlant(res.record))
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }*/

  const fillCountryStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Country.qry,
      parameters: parameters
    })
      .then(res => {
        console.log(res.list)
        setCountryStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
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
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}&_countryId=${agentBranchValidation.values.countryId}&_stateId=${agentBranchValidation.values.stateId}`
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
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}&_cityId=${agentBranchValidation.values.cityId}`

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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar onAdd={addPlant} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editPlant}
          onDelete={delPlant}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <PlantWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={450}
          onSave={handleSubmit}
          plantValidation={plantValidation}
          costCenterStore={costCenterStore}
          plantGroupStore={plantGroupStore}
          segmentStore={segmentStore}
          _labels={_labels}
          maxAccess={access}
          editMode={editMode}

          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          addressLabels={addressLabels}
          countryStore={countryStore}
          stateStore={stateStore}
          fillStateStore={fillStateStore}
          cityStore={cityStore}
          setCityStore={setCityStore}
          lookupCity={lookupCity}
          cityDistrictStore={cityDistrictStore}
          setCityDistrictStore={setCityDistrictStore}
          lookupCityDistrict={lookupCityDistrict}
          fillCountryStore={fillCountryStore}
          addressValidation={addressValidation}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Plants
