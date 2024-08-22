import React, { useContext } from 'react'
import Table from './Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { formatDateDefault } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'

const Approvals = props => {
  const { recordId, functionId } = props
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: DocumentReleaseRepository.Approvals.qry,
    datasetId: ResourceIds.FRT_DR_approvals
  })

  const columns = [
    {
      field: 'seqNo',
      headerName: _labels.seqNo,
      flex: 1
    },
    {
      field: 'codeName',
      headerName: _labels.code,
      flex: 1
    },
    ,
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'email',
      headerName: _labels.email,
      flex: 1
    },
    {
      field: 'responseName',

      headerName: _labels.response,
      flex: 1
    },
    {
      field: 'functionName',
      headerName: _labels.function,
      flex: 1
    },
    {
      field: 'notes',
      headerName: _labels.notes,
      flex: 1
    }
  ]

  async function fetchGridData() {
    return await getRequest({
      extension: DocumentReleaseRepository.Approvals.qry,
      parameters: `_recordId=${recordId}&_functionId=${functionId}`
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default Approvals
