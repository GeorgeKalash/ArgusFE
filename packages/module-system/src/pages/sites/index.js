import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useInvalidate, useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import SitesForm from './forms/SitesForm'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const Sites = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext) 

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: InventoryRepository.Site.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: InventoryRepository.Site.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const {
    query: { data },
    labels,
    access,
    filterBy,
    refetch,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.Site.page,
    datasetId: ResourceIds.Sites,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Site.page
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    ,
    {
      field: 'plantName',
      headerName: labels.plant,
      flex: 1
    },
    {
      field: 'costCenterName',
      headerName: labels.costCenter,
      flex: 1
    },
    {
      field: 'siteGroupName',
      headerName: labels.siteGroup,
      flex: 1
    },
    {
      field: 'allowNegativeQty',
      headerName: labels.anq,
      type: 'checkbox',
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: labels.isInactive,
      type: 'checkbox',
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.Site.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: SitesForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 500,
      height: 580,
      title: labels.sites
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onAdd={add}
          maxAccess={access}
          reportName={'IVSI'}
          filterBy={filterBy}
          previewReport={ResourceIds.Sites}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          refetch={refetch}
          maxAccess={access}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default Sites
