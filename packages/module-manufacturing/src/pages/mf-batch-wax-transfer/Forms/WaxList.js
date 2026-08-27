import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

export default function WaxList({ jobIds }) {
  const { getRequest } = useContext(RequestsContext)

  async function fetchGridData() {
    if (!jobIds?.length) return { list: [] }

    return await getRequest({
      extension: FoundryRepository.WaxJob.qry3,
      parameters: `_jobIds=${jobIds.join(',')}`
    })
  }

  const {
    query: { data },
    labels,
    access: maxAccess
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FoundryRepository.WaxJob.qry3,
    datasetId: ResourceIds.BatchWaxTransfer
  })

  const columns = [
    { 
      field: 'waxRef', 
      headerName: labels?.wax, 
      flex: 1 
    },
    { 
      field: 'jobRef', 
      headerName: labels?.jobRef, 
      flex: 1 
    },
    { 
      field: 'rmWgt', 
      headerName: labels?.rmWeight, 
      flex: 1, 
      type: 'number' 
    },
    { 
      field: 'pieces', 
      headerName: labels?.pieces, 
      flex: 1, 
      type: 'number' 
    }
  ]

  const rows = (data?.list || []).map((wax, index) => ({
    ...wax,
    id: index + 1
  }))

  return (
      <VertLayout>
        <Grow>
          <Table
            name='waxTable'
            columns={columns}
            gridData={{ list: rows }}
            rowId={['waxId']}
            maxAccess={maxAccess}
            pagination={false}
          />
        </Grow>
      </VertLayout>
  )
}