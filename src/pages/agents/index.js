import { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import AgentWindow from './Windows/AgentWindow'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

const Agent = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgents.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceSettingsRepository.CorrespondentAgents.page,
    datasetId: ResourceIds.CorrespondentAgents
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.CorrespondentAgents.page
  })

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    
    {
      field: 'countryRef',
      headerName: _labels.countryRef,
      flex: 1
    },
    {
      field: 'countryName',
      headerName: _labels.countryName,
      flex: 1
    }
  ]

  const add = () => {
    setWindowOpen(true)
  }

  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
  }

  const del = async obj => {
    await postRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgents.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  return (
    <VertLayout>
      <GridToolbar onAdd={add} maxAccess={access} />
      <Table
        columns={columns}
        gridData={data}
        rowId={['recordId']}
        onEdit={edit}
        onDelete={del}
        isLoading={false}
        pageSize={50}
        paginationType='client'
        maxAccess={access}
      />
      {windowOpen && (
        <AgentWindow
        onClose={() => {
          setWindowOpen(false)
          setSelectedRecordId(null)
        }}
        labels={_labels}
        maxAccess={access}
        recordId={selectedRecordId}
        setSelectedRecordId={setSelectedRecordId}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </ VertLayout>
  )
}

export default Agent
