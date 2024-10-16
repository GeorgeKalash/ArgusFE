import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import ItemWindow from './window/ItemWindow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const IvItems = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: InventoryRepository.Items.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}&filter=&_sortField=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    filterBy,
    clearFilter,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.Items.snapshot,
    datasetId: ResourceIds.Items,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: InventoryRepository.Items.snapshot,
        parameters: `_size=1000&_startAt=0&_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const columns = [
    {
      field: 'sku',
      headerName: _labels.sku,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'flName',
      headerName: _labels.flName,
      flex: 1
    },
    {
      field: 'shortName',
      headerName: _labels.shortName,
      flex: 1
    },
    {
      field: 'description',
      headerName: _labels.description,
      flex: 1
    },
    {
      field: 'categoryName',
      headerName: _labels.category,
      flex: 1
    },
    {
      field: 'msName',
      headerName: _labels.measure,
      flex: 1
    },
    {
      field: 'ptName',
      headerName: _labels.priceType,
      flex: 1
    },
    {
      field: 'volume',
      headerName: _labels.volume,
      flex: 1
    },
    {
      field: 'weight',
      headerName: _labels.weight,
      flex: 1
    }
  ]

  function openForm(obj) {
    stack({
      Component: ItemWindow,
      props: {
        labels: _labels,
        recordId: obj?.recordId,
        msId: obj?.msId,
        maxAccess: access
      },
      width: 1200,
      height: 660,
      title: _labels.items + ' ' + (obj?.sku || '')
    })
  }

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.Items.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
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
          onSearch={onSearch}
          onClear={onClear}
          reportName={'IVIT'}
          labels={_labels}
          inputSearch={true}
          onApply={onApply}
          refetch={refetch}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default IvItems
