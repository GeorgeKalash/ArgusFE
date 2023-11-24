import React, {useState, useEffect} from 'react'
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
import { getNewAgentBranch , populateAgentBranch} from 'src/Models/RemittanceSettings/AgentBranch'

const Agent = () => {

  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext);

  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])

  //state
 const [activeTab, setActiveTab] = useState(0)
 const [windowOpen, setWindowOpen] = useState(false)
 const [errorMessage, setErrorMessage] = useState(null)
const [agentStore, setAgentStore] = useState()

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

        // fillSysFunctionsStore()
        // fillActiveStatusStore()
        getLabels(ResourceIds.CorrespondentAgentBranch, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])


  const agentBranchValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      agent: yup.string().required('This field is required'),
      swiftCode: yup.string().required('This field is required')

    }),
    onSubmit: values => {
      console.log({ values })
      postProfession(values)
    }
  })

  const _labels = {
    agent: labels && labels.find(item => item.key === 1) && labels.find(item => item.key === 1).value,
    swiftCode: labels &&  labels.find(item => item.key === 3) && labels.find(item => item.key === 3).value,
    title: labels &&  labels.find(item => item.key === 4) && labels.find(item => item.key === 4).value

  }

const columns =[
  {
    field: 'agent',
    headerName: _labels.agnet,
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


  function addAgentBranch(){
    agentBranchValidation.setValues(getNewAgentBranch)
    fillCurrencyStore()

    setWindowOpen(true)
  }
  function editAgentBranch(){
    agentBranchValidation.setValues(populateAgentBranch)
    fillCurrencyStore()
    setWindowOpen(true)

  }
  function delAgentBranch(){

  }

  const handleSubmit = () => {
    agentBranchValidation.handleSubmit()
  }

  const fillCurrencyStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgentBranches.qry,
      parameters: parameters
    })
      .then(res => {
        setAgentStore(res.list)
        console.log(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
    }

  return (
    <>
    <Box>
    <GridToolbar  onAdd={addAgentBranch}  maxAccess={access} />
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
          onSave={handleSubmit}
          agentStore={agentStore}
          agentBranchValidation={agentBranchValidation}
          labels={_labels}
          maxAccess={access}
        />
      )}
    </>
  )
}

export default Agent
