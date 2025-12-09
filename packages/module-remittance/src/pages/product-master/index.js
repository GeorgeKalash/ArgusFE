import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ProductMasterWindow from './Windows/ProductMasterWindow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'

const ProductMaster = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    invalidate,
    filterBy,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceSettingsRepository.ProductMaster.qry,
    datasetId: ResourceIds.ProductMaster,
    filter: {
      endpointId: RemittanceSettingsRepository.ProductMaster.snapshot,
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ filters, pagination }) {
    return filters.qry
      ? await getRequest({
          extension: RemittanceSettingsRepository.ProductMaster.snapshot,
          parameters: `_filter=${filters.qry}`
        })
      : await fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    var parameters = defaultParams

    const response = await getRequest({
      extension: RemittanceSettingsRepository.ProductMaster.page,
      parameters: parameters
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
      field: 'commissionBaseName',
      headerName: _labels.commissionBase,
      flex: 1
    },
    {
      field: 'accessLevelName',
      headerName: _labels.accessLevel,
      flex: 1
    },
    {
      field: 'corName',
      headerName: _labels.correspondent,
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: _labels.isInactive,
      type: 'checkbox'
    }
  ]

  const del = obj => {
    postRequest({
      extension: RemittanceSettingsRepository.ProductMaster.del,
      record: JSON.stringify(obj)
    }).then(res => {
      toast.success(platformLabels.Deleted)
      invalidate()
    })
  }

  const add = () => {
    openForm('')
  }

  function openForm(recordId) {
    stack({
      Component: ProductMasterWindow,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 1000,

      title: _labels?.productMaster
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar labels={_labels} onAdd={add} maxAccess={access} reportName={'RTPRO'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
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

export default ProductMaster
