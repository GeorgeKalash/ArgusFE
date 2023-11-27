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
import { SystemRepository } from 'src/repositories/SystemRepository'

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
        // setErrorMessage(error)
      })
  }
  useEffect(() => {
    if (!access) getAccess(ResourceIds.CorrespondentAgentBranch, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })

        getLabels(ResourceIds.CorrespondentAgentBranch, setLabels)
        getLabels(ResourceIds.Address, setAddressLabels)
        fillStore()
        fillCountryStore()
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
      swiftCode: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required'),
      stateId: yup.string().required('This field is required'),
      street1: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log('{ values }')

      console.log({ values })
      postAgentBranch(values)
    }
  })

  const _labels = {
    agent: labels && labels.find(item => item.key === 1) && labels.find(item => item.key === 1).value,
    swiftCode: labels && labels.find(item => item.key === 3) && labels.find(item => item.key === 3).value,
    title: labels && labels.find(item => item.key === 4) && labels.find(item => item.key === 4).value,

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

    postCode:
      addressLabels && addressLabels.find(item => item.key === 9) && addressLabels.find(item => item.key === 9).value,
    phone:
      addressLabels && addressLabels.find(item => item.key === 10) && addressLabels.find(item => item.key === 10).value,
    phone2:
      addressLabels && addressLabels.find(item => item.key === 12) && addressLabels.find(item => item.key === 11).value,
    phone3:
      addressLabels && addressLabels.find(item => item.key === 12) && addressLabels.find(item => item.key === 12).value,
    address:
      addressLabels && addressLabels.find(item => item.key === 13) && addressLabels.find(item => item.key === 13).value
  }

  const columns = [
    {
      field: 'agentId',
      headerName: _labels.agnetId,
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
  const tabs = [{ label: 'Main' }, { label: 'Address' }]

  function addAgentBranch() {
    setActiveTab(0)
    agentBranchValidation.setValues({})
    agentBranchValidation.setValues(getNewAgentBranch)
    setWindowOpen(true)
  }

  // useEffect(() => {
  //   if (activeTab === 1){
  //     // agentBranchValidation.setValues({})
  //   var parameters = `_filter=` + '&_recordId=' + agentBranchValidation.values.addressId
  //   getRequest({
  //     extension: SystemRepository.Address.get,
  //     parameters: parameters
  //   })
  //     .then(res => {

  //       if (res) agentBranchValidation.setValues(populateAgentBranch(res.record))
  //     })
  //     .catch(error => {})}
  // }, [activeTab])

  const editAgentBranch = obj => {
    // agentBranchValidation.setValues({})
    var parameters = `_filter=` + '&_recordId=' + obj.addressId
    var object = obj
    getRequest({
      extension: SystemRepository.Address.get,
      parameters: parameters
    })
      .then(res => {

        var result = res.record
        fillStateStore()
        object.name =  result.name
        object.street1 =  result.street1
        object.street2 =  result.street2
        object.email1 =  result.email1
        object.email2 =  result.email2
        object.countryId =  result.countryId
        object.cityId =  result.cityId
        object.stateId =  result.stateId
        object.phone =  result.phone
        object.phone1 =  result.phone1
        object.phone2 =  result.phone2
        fillStateStore(result.countryId)
        agentBranchValidation.setValues(populateAgentBranch(object))
        setActiveTab(0)
        setWindowOpen(true)

      })
      .catch(error => {})

    // agentBranchValidation.setValues(populateAgentBranch(obj))

  }

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
        // setErrorMessage(error)
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
    agentBranchValidation.handleSubmit()
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

  const postAgentBranch = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.Address.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        obj.addressId = res.recordId

        postRequest({
          extension: RemittanceSettingsRepository.CorrespondentAgentBranches.set,
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
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillStateStore = countryId => {
    var parameters = `_countryId=${countryId}`
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
          fillCountryStore={fillCountryStore}
          agentBranchValidation={agentBranchValidation}
          maxAccess={access}
        />
      )}
    </>
  )
}

export default Agent
