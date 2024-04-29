import React from 'react'
import { Box } from '@mui/material'
import { useContext } from 'react'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import AgentBranchWindow from './Windows/AgentBranchWindow'
import toast from 'react-hot-toast'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { useInvalidate } from 'src/hooks/resource'

const Agent = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgentBranches.page,

      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_dgId=0`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    refetch,
    labels: _labels,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceSettingsRepository.CorrespondentAgentBranches.page,
    datasetId: ResourceIds.CorrespondentAgentBranch
  })

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

  const del = async obj => {
    await postRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgentBranches.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.CorrespondentAgentBranches.page
  })

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: AgentBranchWindow,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        editMode: recordId && true
      },
      width: 1000,
      height: 600,
      title: _labels.agentBranch
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
        <GridToolbar onAdd={add} maxAccess={access} labels={_labels} />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          refetch={refetch}
          paginationType='api'
          paginationParameters={paginationParameters}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
    </>
  )
}

export default Agent
