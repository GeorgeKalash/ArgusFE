import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { Router } from '@argus/shared-domain/src/lib/useRouter'
import { ProductModelingRepository } from '@argus/repositories/src/repositories/ProductModelingRepository'
import ProductModelingDTDForm from './form/ProductModelingDTDForm'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'

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
      case SystemFunction.ThreeDPrint:
        return ResourceIds.ThreePrintingDTD
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

  const getReportName = functionId => {
    switch (functionId) {
      case SystemFunction.Sketch:
        return 'PMDTDa'
      case SystemFunction.ThreeDDesign:
        return 'PMDTDb'
      case SystemFunction.Rubber:
        return 'PMDTDc'
      case SystemFunction.ModelMaker:
        return 'PMDTDd'
      case SystemFunction.ModellingCasting:
        return 'PMDTDe'
      case SystemFunction.ThreeDPrint:
        return 'PMDTDf'
    }
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onAdd={add}
          hasSearch={false}
          maxAccess={access}
          reportName={getReportName(parseInt(functionId))}
          filterBy={filterBy}
        />
      </Fixed>
      <Grow>
        <Table
          name='table'
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
