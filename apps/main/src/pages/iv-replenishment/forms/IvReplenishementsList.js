import { useContext } from 'react'
import Table from '@argus/shared-ui/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/hooks/resource'
import { VertLayout } from '@argus/shared-ui/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/components/Layouts/Grow'
import { IVReplenishementRepository } from '@argus/repositories/repositories/IVReplenishementRepository'

const IvReplenishementsList = ({ store, labels, maxAccess }) => {
  const { getRequest } = useContext(RequestsContext)
  const { recordId } = store

  async function fetchGridData() {
    return await getRequest({
      extension: IVReplenishementRepository.IvReplenishementsList.qry,
      parameters: `&_replenishmentId=${recordId}`
    })
  }

  const {
    query: { data },
    labels: _labels
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.IvReplenishements,
    queryFn: fetchGridData,
    endpointId: IVReplenishementRepository.IvReplenishementsList.qry
  })

  const columns = [
    {
      field: 'plantName',
      headerName: labels.palnt,
      flex: 1
    },
    {
      field: 'transferRef',
      headerName: labels.transferRef,
      flex: 1
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='replenishments'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          pageSize={50}
          pagination={false}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default IvReplenishementsList
