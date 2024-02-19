import React, { useEffect } from 'react'
import CustomTabPanel from './CustomTabPanel'

import Table from './Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { useResourceQuery } from 'src/hooks/resource'

const Approvals = (props) =>{
  const {recordId , functionId }= props

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn : fetchGridData,
    endpointId : DocumentReleaseRepository.Approvals.qry,
    datasetId: ResourceIds.FRT_DR_approvals
  })

const columns = [
  {
    field: 'seqNo',
    headerName: _labels.seqNo,
    flex: 1,

  },
  {
    field: 'code',
    headerName: _labels.code,
    flex: 1
  },
  ,
  {
    field: 'date',
    headerName: _labels.date,
    flex: 1
  },
  {
    field: 'email',
    headerName: _labels.email,
    flex: 1
  },
  {
    field: 'response',

    headerName: _labels.response,
    flex: 1
  },
  {
    field: 'function',
    headerName: _labels.function,
    flex: 1
  },
  {
    field: 'Notes',
    headerName: _labels.notes,
    flex: 1
  }

]
async function fetchGridData() {
  return await getRequest({
    extension: DocumentReleaseRepository.Approvals.qry,
    parameters: `_recordId=${recordId}&_functionId=${functionId}`,
  })
}

  return (
  <CustomTabPanel>
        <Table
          height={200}
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          maxAccess={access}
          pagination={false}
        />
  </CustomTabPanel>

  )
}

export default Approvals
