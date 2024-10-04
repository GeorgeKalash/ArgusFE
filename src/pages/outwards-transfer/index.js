import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
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
      headerName: _labels.CountryRef,
      flex: 1
    },
    {
      field: 'dispersalName',
      headerName: _labels.DispersalName,
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
      headerName: _labels.ReleaseStatus,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.Status,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: _labels.WIP,
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
