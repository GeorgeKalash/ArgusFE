import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import AddressBookForm from './forms/AddressBookForm'

const AddressBook = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: SystemRepository.Address.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  const {
    query: { data },
    search,
    clear,
    refetch,
    labels: _labels,
    paginationParameters,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.Address.qry,
    datasetId: ResourceIds.Address,
    search: {
      searchFn: fetchWithSearch
    }
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams

    const response = await getRequest({
      extension: SystemRepository.Address.qry,
      parameters: parameters
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'countryName',
      headerName: _labels.country,
      flex: 1
    },
    {
      field: 'stateName',
      headerName: _labels.state,
      flex: 1
    },
    {
      field: 'city',
      headerName: _labels.city,
      flex: 1
    },
    {
      field: 'street1',
      headerName: _labels.street1,
      flex: 1
    },
    {
      field: 'phone',
      headerName: _labels.phone,
      flex: 1
    },
    {
      field: 'email1',
      headerName: _labels.email1,
      flex: 1
    }
  ]

  const editAddress = obj => {
    openForm(obj?.recordId)
  }

  function openForm(id) {
    stack({
      Component: AddressBookForm,
      props: {
        _labels: _labels,
        access,
        recordId: id,
        invalidate
      },
      width: 600,
      height: 500,
      title: _labels.address
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={access} onSearch={search} onSearchClear={clear} labels={_labels} inputSearch={true} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={editAddress}
          refetch={refetch}
          paginationType='api'
          paginationParameters={paginationParameters}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default AddressBook
