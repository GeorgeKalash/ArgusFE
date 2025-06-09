import { useContext } from 'react'
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
import { SystemFunction } from 'src/resources/SystemFunction'
import { Router } from 'src/lib/useRouter'
import { ProductModelingRepository } from 'src/repositories/ProductModelingRepository'
import ProductModelingDTDForm from './form/ProductModelingDTDForm'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const ProductModelingDTD = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { functionId } = Router()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: ProductModelingRepository.DocumentTypeDefault.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_functionId=${functionId}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.Sketch:
        return ResourceIds.SketchDTD
      case SystemFunction.ThreeDDesign:
        return ResourceIds.ThreeDDrawingDTD
      case SystemFunction.ModellingCasting:
        return ResourceIds.CastingDTD
      case SystemFunction.Rubber:
        return ResourceIds.RubberDTD
      case SystemFunction.ModelMaker:
        return ResourceIds.ModelDTD
    }
  }

  const {
    query: { data },
    labels,
    refetch,
    filterBy,
    invalidate,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ProductModelingRepository.DocumentTypeDefault.page,
    datasetId: ResourceIds.SketchDTD,
    DatasetIdAccess: getResourceId(parseInt(functionId)),
    filter: {
      filterFn: fetchWithFilter,
      default: { functionId }
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const columns = [
    {
      field: 'dtName',
      headerName: labels.documentType,
      flex: 1
    },
    {
      field: 'productionLineName',
      headerName: labels.productionLine,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  const resourceId = getResourceId(parseInt(functionId))

  function openForm(record) {
    stack({
      Component: ProductModelingDTDForm,
      props: {
        labels,
        recordId: record?.dtId,
        maxAccess: access,
        resourceId,
        functionId
      },
      width: 500,
      height: 380,
      title: labels.DocumentTypeDefault
    })
  }

  const add = async () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: ProductModelingRepository.DocumentTypeDefault.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} hasSearch={false} maxAccess={access} reportName={'PMDTD'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['dtId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          refetch={refetch}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default ProductModelingDTD
