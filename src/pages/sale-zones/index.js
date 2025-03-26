import { useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import Tree from 'src/components/Shared/Tree'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import SaleZoneForm from './forms/SaleZoneForm'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const SalesZone = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [dataTree, setDataTree] = useState([])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: SaleRepository.SalesZone.page,
      parameters: `_pageSize=${_pageSize}&_startAt=${_startAt}&_filter=&_sortField=`
    })

    return { ...response, _startAt: _startAt }
  }
  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: SaleRepository.SalesZone.snapshot,
        parameters: `_filter=${filters.qry}&_sortField=`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0 })
  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    invalidate,
    paginationParameters,
    access,
    filterBy,
    clearFilter
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.SalesZone.page,
    datasetId: ResourceIds.SalesZone,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  useEffect(() => {
    ;(async () => {
      const response = await getRequest({
        extension: SaleRepository.SalesZone.page,
        parameters: `_pageSize=1000&_startAt=0&_filter=&_sortField=`
      })
      setDataTree(response)
    })()
  }, [])

  const columns = [
    {
      field: 'szRef',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },

    {
      field: 'parentRef',
      headerName: _labels.parentRef,
      flex: 1
    },
    {
      field: 'parentName',
      headerName: _labels.parent,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: SaleRepository.SalesZone.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: SaleZoneForm,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 600,
      height: 450,
      title: _labels.saleZones
    })
  }

  function onTreeClick() {
    stack({
      Component: Tree,
      props: {
        data: dataTree
      },
      width: 500,
      height: 400,
      title: _labels.tree
    })
  }

  const actions = [
    {
      key: 'Tree',
      condition: true,
      onClick: onTreeClick,
      disabled: false
    }
  ]

  const edit = obj => {
    openForm(obj?.recordId)
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
          actions={actions}
          onTree={onTreeClick}
          onSearch={onSearch}
          onClear={onClear}
          previewReport={ResourceIds.SalesZone}
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

export default SalesZone
