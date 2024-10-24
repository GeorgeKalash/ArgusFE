import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { getStorageData } from 'src/storage/storage'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import ProductionSheetForm from './Forms/ProductionSheetForm'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const ProductionSheet = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: ManufacturingRepository.ProductionSheet.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access,
    invalidate,
    filterBy,
    clearFilter
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.ProductionSheet.qry,
    datasetId: ResourceIds.ProductionSheet,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },

    {
      field: 'siteRef',
      headerName: _labels.siteRef,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: _labels.site,
      flex: 1
    },
    {
      field: 'plantName',
      headerName: _labels.plant,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const getPlantId = async () => {
    const userId = getStorageData('userData').userId

    const res = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: `_userId=${userId}&_key=plantId`
    })

    return res?.record?.value
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: ManufacturingRepository.ProductionSheet.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }


  function OpenProductionSheetForm(plantId, recordId) {
    stack({
      Component: ProductionSheetForm,
      props: {
        labels: _labels,
        recordId,
        plantId,
        maxAccess: access
      },
      width: 1000,
      height: 680,
      title: _labels.ProductionSheet
    })
  }

  async function openForm(recordId) {
    const plantId = await getPlantId()

    OpenProductionSheetForm(plantId, recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.ProductionSheet.del,
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
          onSearch={onSearch}
          onClear={onClear} 
          onAdd={add}
          labels={_labels} 
          maxAccess={access} 
          onApply={onApply} 
          reportName={'MFPST'} 
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
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default ProductionSheet
