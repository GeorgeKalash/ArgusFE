import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import SiteGroupsForm from './forms/SiteGroupsForm'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'

const SiteGroups = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: InventoryRepository.SiteGroups.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access,

    search,
    clear,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.SiteGroups.qry,
    datasetId: ResourceIds.SiteGroups,
    search: {
      endpointId: InventoryRepository.SiteGroups.qry,
      searchFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: InventoryRepository.SiteGroups.qry,
      parameters: `_filter=${qry}`
    })

    const filteredData = response.list.filter(
      item =>
        item.name.toLowerCase().includes(qry.toLowerCase()) ||
        (item.reference && item.reference.toLowerCase().includes(qry.toLowerCase()))
    )

    return { ...response, list: filteredData }
  }

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.SiteGroups.qry
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    }
  ]

  const del = async obj => {
    try {
      await postRequest({
        extension: InventoryRepository.SiteGroups.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: SiteGroupsForm,
      props: {
        labels: _labels,
        recordId,
        maxAccess: access
      },
      width: 500,
      height: 400,
      title: _labels.siteGroup
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          labels={_labels}
          inputSearch={true}
          onSearch={search}
          onSearchClear={clear}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          refetch={refetch}
          onDelete={del}
          maxAccess={access}
          pageSize={50}
          paginationType='client'
        />
      </Grow>
    </VertLayout>
  )
}

export default SiteGroups
