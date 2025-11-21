import { useContext } from 'react'
import toast from 'react-hot-toast'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import SalesPersonWindow from './Windows/SalesPersonWindow'

const SalesPerson = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: SaleRepository.SalesPerson.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: SaleRepository.SalesPerson.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  const {
    query: { data },
    search,
    clear,
    refetch,
    labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.SalesPerson.page,
    datasetId: ResourceIds.SalesPerson,
    search: {
      searchFn: fetchWithSearch
    }
  })

  const columns = [
    {
      field: 'spRef',
      headerName: labels.SalesPerson,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'cellPhone',
      headerName: labels.phone,
      flex: 1
    },
    {
      field: 'commissionPct',
      headerName: labels.commissionPct,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: SalesPersonWindow,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 600,
      height: 550,
      title: labels.SalesPerson
    })
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: SaleRepository.SalesPerson.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          previewReport={ResourceIds.SalesPerson}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          deleteConfirmationType={'strict'}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default SalesPerson
