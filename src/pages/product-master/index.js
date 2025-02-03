import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import ProductMasterWindow from './Windows/ProductMasterWindow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

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
    clearFilter,
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
          labels={_labels}
          onAdd={add}
          maxAccess={access}
          onApply={onApply}
          reportName={'RTPRO'}
        />
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
