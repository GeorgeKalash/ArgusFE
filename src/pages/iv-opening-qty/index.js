import { useContext } from 'react'
import toast from 'react-hot-toast'
import { useWindow } from 'src/windows'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ControlContext } from 'src/providers/ControlContext'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import InventoryOpeningQtysForm from './forms/InventoryOpeningQtysForm'

const InventoryOpeningQtys = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: InventoryRepository.InventoryOpeningQtys.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_params=&_sortBy=year desc`
    })
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    filterBy,
    clearFilter,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.InventoryOpeningQtys.qry,
    datasetId: ResourceIds.InventoryOpeningQtys,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    try {
      if (filters?.qry) {
        return await getRequest({
          extension: InventoryRepository.InventoryOpeningQtys.snapshot,
          parameters: `_filter=${filters.qry}`
        })
      } else {
        return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
      }
    } catch (error) {}
  }

  const columns = [
    {
      field: 'year',
      headerName: _labels.fiscalYear,
      flex: 1
    },
    {
      field: 'siteRef',
      headerName: _labels.siteRef,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: _labels.siteName,
      flex: 1
    },
    {
      field: 'sku',
      headerName: _labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: _labels.itemName,
      flex: 1
    },
    {
      field: 'qty',
      headerName: _labels.qty,
      flex: 1
    },
    {
      field: 'pieces',
      headerName: _labels.pieces,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  function openForm(record) {
    stack({
      Component: InventoryOpeningQtysForm,
      props: {
        labels: _labels,
        record,
        maxAccess: access,
        recordId: record ? String(record.year) + String(record.itemId) + String(record.siteId) : null
      },
      width: 780,
      height: 550,
      title: _labels.openingQtys
    })
  }

  const edit = obj => {
    openForm(obj)
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: InventoryRepository.InventoryOpeningQtys.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
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
          onAdd={add}
          maxAccess={access}
          onApply={onApply}
          onSearch={onSearch}
          onClear={onClear}
          reportName={'IVOQ'}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['year', 'itemId', 'siteId']}
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

export default InventoryOpeningQtys
