import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { useContext } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import AgentBranchWindow from './Windows/AgentBranchWindow'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { getNewAgentBranch, populateAgentBranch } from 'src/Models/RemittanceSettings/AgentBranch'
import { getNewAddress, populateAddress } from 'src/Models/System/Address'
import { SystemRepository } from 'src/repositories/SystemRepository'
import toast from 'react-hot-toast'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

const Agent = () => {
  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [labels, setLabels] = useState(null)
  const [addressLabels, setAddressLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])

  //state
  const [activeTab, setActiveTab] = useState(0)
  const [countryStore, setCountryStore] = useState([])
  const [cityStore, setCityStore] = useState([])
  const [cityDistrictStore, setCityDistrictStore] = useState([])

  const [stateStore, setStateStore] = useState([])

  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [agentStore, setAgentStore] = useState([])

  const getGridData = ({ _startAt = 0, _pageSize = 30 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams + '&_dgId=0'

    getRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgentBranches.page,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.CorrespondentAgentBranch, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })
        getLabels(ResourceIds.CorrespondentAgentBranch, setLabels)
        getLabels(ResourceIds.Address, setAddressLabels)

        //CHANGE
        //fillStore()
        //fillCountryStore()
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const agentBranchValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      agentId: yup.string().required('This field is required'),
      swiftCode: yup.string().required('This field is required')
    }),
    onSubmit: values => {
        postAgent(values)
    }
  })

  const addressValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      /*agentId: yup.string().required('This field is required'),
      swiftCode: yup.string().required('This field is required'),*/
      name: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required'),
      stateId: yup.string().required('This field is required'),
      street1: yup.string().required('This field is required'),
      phone: yup.string().required('This field is required'),
      cityId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log('addressVal:' + values)
      postAgentBranch(values)
    }
  })

  const _labels = {
    agent: labels && labels.find(item => item.key === "1") && labels.find(item => item.key === "1").value,
    swiftCode: labels && labels.find(item => item.key === "3") && labels.find(item => item.key === "3").value,
    title: labels && labels.find(item => item.key === "4") && labels.find(item => item.key === "4").value,
    main: labels && labels.find(item => item.key === "5") && labels.find(item => item.key === "5").value,

    name:
      addressLabels && addressLabels.find(item => item.key === "1") && addressLabels.find(item => item.key === "1").value,
    street1:
      addressLabels && addressLabels.find(item => item.key === "2") && addressLabels.find(item => item.key === "2").value,
    street2:
      addressLabels && addressLabels.find(item => item.key === "3") && addressLabels.find(item => item.key === "3").value,
    email:
      addressLabels && addressLabels.find(item => item.key === "4") && addressLabels.find(item => item.key === "4").value,
    email2:
      addressLabels && addressLabels.find(item => item.key === "5") && addressLabels.find(item => item.key === "5").value,

    country:
      addressLabels && addressLabels.find(item => item.key === "6") && addressLabels.find(item => item.key === "6").value,
    state:
      addressLabels && addressLabels.find(item => item.key === "7") && addressLabels.find(item => item.key === "7").value,
    city:
      addressLabels && addressLabels.find(item => item.key === "8") && addressLabels.find(item => item.key === "8").value,

    postalCode:
      addressLabels && addressLabels.find(item => item.key === "9") && addressLabels.find(item => item.key === "9").value,
    phone:
      addressLabels && addressLabels.find(item => item.key === "10") && addressLabels.find(item => item.key === "10").value,
    phone2:
      addressLabels && addressLabels.find(item => item.key === "11") && addressLabels.find(item => item.key === "11").value,
    phone3:
      addressLabels && addressLabels.find(item => item.key === "12") && addressLabels.find(item => item.key === "12").value,
    address:
      addressLabels && addressLabels.find(item => item.key === "13") && addressLabels.find(item => item.key === "13").value,

    cityDistrict:
      addressLabels && addressLabels.find(item => item.key === "14") && addressLabels.find(item => item.key === "14").value,
    bldgNo:
      addressLabels && addressLabels.find(item => item.key === "15") && addressLabels.find(item => item.key === "15").value,
    unitNo:
      addressLabels && addressLabels.find(item => item.key === "16") && addressLabels.find(item => item.key === "16").value,
    subNo:
      addressLabels && addressLabels.find(item => item.key === "17") && addressLabels.find(item => item.key === "17").value
  }

  const columns = [
    {
      field: 'agentName',
      headerName: _labels.name,
      flex: 1,
      editable: false
    },
    {
      field: 'swiftCode',
      headerName: _labels.swiftCode,
      flex: 1,
      editable: false
    }
  ]
  const tabs = [{ label: _labels.main }, { label: _labels.address }]

  function addAgentBranch() {
    setActiveTab(0)

    //agentBranchValidation.setValues({}) WHYY??
    agentBranchValidation.setValues(getNewAgentBranch)
    addressValidation.setValues(getNewAddress) 
    fillStore()
    setWindowOpen(true)
  }

  const editAgentBranch = obj => { //FIX
    console.log(obj) //to check if address complex is returned or no in this screen
    setActiveTab(0)
    addressValidation.setValues(getNewAddress)

    fillStore()
    fillCountryStore()
    fillStateStore(obj.countryId)

    /*var parameters = `_filter=` + '&_recordId=' + obj.addressId
    var object = obj
    console.log('here')
    console.log(obj)
    if (obj.addressId) {
      getRequest({
        extension: SystemRepository.Address.get,
        parameters: parameters
      })
        .then(res => {
          var result = res.record
          console.log(result)

          object.name = result.name
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
          console.log(object)
          agentBranchValidation.setValues(populateAgentBranch(object))

          // setActiveTab(0)
          // setWindowOpen(true)
        })
        .catch(error => {})
    } else {
      agentBranchValidation.setValues(populateAgentBranch(object))
      setActiveTab(0)
      setWindowOpen(true)
    }*/
  }

//WHAT IS THIS?
  /*useEffect(() => {
    // setActiveTab(0)
    stateStore.length > 0 && setWindowOpen(true)
  }, [stateStore])*/

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

  const delAgentBranch = obj => {
    postRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgentBranches.del,
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

  const handleSubmit = () => {
    if (activeTab === 0) agentBranchValidation.handleSubmit()   
    else if (activeTab === 1) {
      agentBranchValidation.handleSubmit() &&  addressValidation.handleSubmit() //this will cause to save tab 1 first! is their always a need in edit mode?
      
    }
  }

  const fillStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgents.qry,
      parameters: parameters
    })
      .then(res => {
        setAgentStore(res.list)
        console.log('test:' + res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  //post first tab
  const postAgent = obj => {
    var recordId = obj.recordId

    postRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgentBranches.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        agentBranchValidation.setFieldValue('recordId', res.recordId)  

        //setRecord(res.recordId) i replaced this by setting it in validation directly
        if (!recordId) 
        {
          toast.success('Record Added Successfully')
        }
        else toast.success('Record Editted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  //ADDRESS TAB

  const postAgentBranch = obj => {
    console.log(obj)
    const object = obj

    //const Id = object.recordId
   // obj.recordId = obj.addressId > 0 ? obj.addressId : obj.recordId
    //console.log('object')
    //console.log(object)
    
    //console.log(Id)

    postRequest({
      extension: SystemRepository.Address.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        //obj.addressId = res.addressId > 0 ? res.addressId : res.recordId

        //console.log(record)
        //object.recordId = record > 0 ? record : object.recordId

        //object.recordId = Id
        obj.recordId = res.recordId
        addressValidation.setFieldValue('recordId', obj.recordId) 
        console.log(object.recordId)
        agentBranchValidation.setFieldValue('addressId',  obj.recordId )
        agentBranchValidation.handleSubmit()

        /*postRequest({
          extension: RemittanceSettingsRepository.CorrespondentAgentBranches.set,
          record: JSON.stringify(object)
        })
          .then(res => {
            getGridData({})
            setWindowOpen(false)
            if (!res.recordId) toast.success('Record Added Successfully')
            else toast.success('Record Editted Successfully')
          })
          .catch(error => {
            setErrorMessage(error)
          })*/

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
      <Box>
        <GridToolbar onAdd={addAgentBranch} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editAgentBranch}
          onDelete={delAgentBranch}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <AgentBranchWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          tabs={tabs}
          agentStore={agentStore}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          labels={_labels}
          addressLabels={addressLabels}
          onSave={handleSubmit}
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
          agentBranchValidation={agentBranchValidation}
          addressValidation={addressValidation}
          maxAccess={access}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Agent

// setedit mode not done in this screen