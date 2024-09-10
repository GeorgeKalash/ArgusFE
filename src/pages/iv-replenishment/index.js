import { useContext } from 'react'
import toast from 'react-hot-toast'
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
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    try {
      const response = await getRequest({
        extension: IVReplenishementRepository.IvReplenishements.page,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_sortField=&_params=`
      })

      return { ...response, _startAt: _startAt }
    } catch (error) {}
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: IVReplenishementRepository.IvReplenishements.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const {
    query: { data },
    labels: _labels,
    invalidate,
    paginationParameters,
    filterBy,
    clearFilter,
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

  const del = async obj => {
    try {
      await postRequest({
        extension: IVReplenishementRepository.IvReplenishements.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
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

  const onApply = ({ search, rpbParams }) => {
    if (!search && rpbParams.length === 0) {
      clearFilter('params')
    } else if (!search) {
      filterBy('params', rpbParams)
    } else {
      filterBy('qry', search)
    }
    refetch()
  }

  const onSearch = value => {
    filterBy('qry', value)
  }

  const onClear = () => {
    clearFilter('qry')
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onSearch={onSearch}
          onClear={onClear}
          onAdd={add}
          maxAccess={access}
          reportName={'IRHDR'}
          onApply={onApply}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
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
