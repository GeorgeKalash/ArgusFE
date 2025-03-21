import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'
import IvReplenishementsWindow from './windows/IvReplenishementsWindow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const IvReplenishements = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: IVReplenishementRepository.IvReplenishements.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_sortField=&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    filterBy,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: IVReplenishementRepository.IvReplenishements.page,
    datasetId: ResourceIds.IvReplenishements,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'siteName',
      headerName: _labels.site,
      flex: 1
    },
    {
      field: 'dateFrom',
      headerName: _labels.dateFrom,
      flex: 1,
      type: 'date'
    },
    {
      field: 'dateTo',
      headerName: _labels.dateTo,
      flex: 1,
      type: 'date'
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    ,
    {
      field: 'notes',
      headerName: _labels.notes,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: IvReplenishementsWindow,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 600,
      height: 500,
      title: _labels.itemRep
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} hasSearch={false} maxAccess={access} reportName={'IRHDR'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default IvReplenishements
