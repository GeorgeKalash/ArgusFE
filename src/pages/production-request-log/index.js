import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const ProductionRequestLog = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels: _labels,
    refetch,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.LeanProductionPlanning.preview,
    datasetId: ResourceIds.ProductionRequestLog
  })

  const handleSubmit = () => {
    calculateLeans()
  }

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.LeanProductionPlanning.preview
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.preview,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_status=1&_filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'sku',
      headerName: _labels[3],
      flex: 1
    },
    {
      field: 'height',
      headerName: _labels[4],
      flex: 1
    },
    {
      field: 'width',
      headerName: _labels[5],
      flex: 1
    },
    {
      field: 'qty',
      headerName: _labels[6],
      flex: 1
    },
    {
      field: 'totalThickness',
      headerName: _labels[7],
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

    const res = await postRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.update,
      record: JSON.stringify(resultObject)
    })

    toast.success('Record Updated Successfully')
    invalidate()
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data ? data : { list: [] }}
          rowId={['recordId', 'seqNo']}
          isLoading={false}
          maxAccess={access}
          showCheckboxColumn={true}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
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
