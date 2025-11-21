import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import VendorsWindow from './windows/VendorsWindow'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'

const PuVendors = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const {
    query: { data },
    labels: _labels,
    filterBy,
    paginationParameters,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PurchaseRepository.Vendor.page,
    datasetId: ResourceIds.PuVendors,
    filter: {
      filterFn: fetchWithFilter
    }
  })
  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: PurchaseRepository.Vendor.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: PurchaseRepository.Vendor.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

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
    },
    {
      field: 'flName',
      headerName: _labels.flName,
      flex: 1
    }
  ]

  const del = obj => {
    postRequest({
      extension: PurchaseRepository.Vendor.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success(platformLabels.Deleted)
        invalidate()
      })
      .catch(error => {})
  }

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: VendorsWindow,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 700,
      height: 550,
      title: _labels?.vendor
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'PUVEN'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default PuVendors
