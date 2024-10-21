import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const ProductionRequestLog = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const {
    query: { data },
    labels: _labels,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.LeanProductionPlanning.preview,
    datasetId: ResourceIds.ProductionRequestLog
  })

  const handleSubmit = () => {
    calculateLeans()
  }

  async function fetchGridData() {
    return await getRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.preview,
      parameters: `_status=1`
    })
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'checked',
      headerName: '',
      type: 'checkbox',
      editable: true
    },
    {
      field: 'sku',
      headerName: _labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: _labels.description,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'qty',
      headerName: _labels.qty,
      flex: 1
    }
  ]

  const calculateLeans = async () => {
    const checkedObjects = data.list.filter(obj => obj.checked)
    checkedObjects.forEach(obj => {
      obj.status = 2
    })

    const resultObject = {
      leanProductions: checkedObjects
    }

    await postRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.update,
      record: JSON.stringify(resultObject)
    })

    toast.success(platformLabels.Updated)
    invalidate()
  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId', 'itemId', 'functionId']}
          onDelete={del}
          isLoading={false}
          maxAccess={access}
          pageSize={50}
          paginationType='client'
          refetch={refetch}
        />
      </Grow>
      <Fixed>
        <WindowToolbar onSave={handleSubmit} isSaved={true} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

export default ProductionRequestLog
