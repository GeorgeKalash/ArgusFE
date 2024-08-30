import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'

const IvReplenishementsList = ({ store, labels, maxAccess }) => {
  const { getRequest } = useContext(RequestsContext)
  const { recordId } = store

  async function fetchGridData() {
    return await getRequest({
      extension: IVReplenishementRepository.IvReplenishementsList.qry,
      parameters: `&_replenishmentId=${recordId}`
    })

    return response
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
