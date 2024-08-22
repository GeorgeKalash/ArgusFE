import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
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
      : await fetchGridData(pagination)
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
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
    }
  ]

  const del = obj => {
    postRequest({
      extension: RemittanceSettingsRepository.ProductMaster.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success(platformLabels.Deleted)
        invalidate()
      })
      .catch(error => {})
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
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          inputSearch={true}
        />
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

export default ProductMaster
