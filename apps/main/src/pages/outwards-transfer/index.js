import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { RemittanceOutwardsRepository } from '@argus/repositories/src/repositories/RemittanceOutwardsRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import OutwardsTransferForm from './Tabs/OutwardsTransferForm'

const OutwardsTransfer = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const {
    query: { data },
    filterBy,
    refetch,
    clearFilter,
    labels: _labels,
    maxAccess
  } = useResourceQuery({
    endpointId: RemittanceOutwardsRepository.OutwardsTransfer.snapshot,
    datasetId: ResourceIds.OutwardsTransfer,
    filter: {
      endpointId: RemittanceOutwardsRepository.OutwardsTransfer.snapshot,
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ filters }) {
    if (!filters.qry) {
      return { list: [] }
    } else {
      return await getRequest({
        extension: RemittanceOutwardsRepository.OutwardsTransfer.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    }
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'countryRef',
      headerName: _labels.Country,
      flex: 1
    },
    {
      field: 'dispersalName',
      headerName: _labels.DispersalType,
      flex: 1
    },
    ,
    {
      field: 'currencyRef',
      headerName: _labels.Currency,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: _labels.rsName,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.Status,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: _labels.wip,
      flex: 1
    }
  ]

  const editOutwards = obj => {
    openForm(obj.recordId)
  }

  async function openForm(recordId) {
    stack({
      Component: OutwardsTransferForm,
      props: {
        maxAccess,
        labels: _labels,
        recordId: recordId
      },
      width: 1100,
      height: 600,
      title: _labels.OutwardsTransfer
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          maxAccess={maxAccess}
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          labels={_labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={editOutwards}
          pageSize={50}
          paginationType='client'
          maxAccess={maxAccess}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default OutwardsTransfer
