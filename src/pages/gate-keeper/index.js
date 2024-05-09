import { useContext } from 'react'
import { Box } from '@mui/material'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { useWindow } from 'src/windows'
import MaterialsAdjustmentForm from '../materials-adjustment/Forms/MaterialsAdjustmentForm'
import useResourceParams from 'src/hooks/useResourceParams'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const GateKeeper = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels: _labels,
    refetch,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.LeanProductionPlanning.preview,
    datasetId: ResourceIds.GateKeeper
  })

  const { labels: _labelsADJ, access: accessADJ } = useResourceParams({
    datasetId: ResourceIds.MaterialsAdjustment
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.LeanProductionPlanning.preview
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.preview,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_status=2`
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'sku',
      headerName: _labels[1],
      flex: 1
    },
    {
      field: 'qty',
      headerName: _labels[2],
      flex: 1
    },
    {
      field: 'itemName',
      headerName: _labels[4],
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels[6],
      flex: 1,
      valueFormatter: params => {
        const dateString = params.value
        const timestamp = parseInt(dateString.match(/\d+/)[0], 10)

        if (!isNaN(timestamp)) {
          const formattedDate = new Date(timestamp).toLocaleDateString('en-GB')

          return formattedDate
        } else {
          return 'Invalid Date'
        }
      }
    }
  ]

  const handleSubmit = () => {
    generateLean()
  }

  const generateLean = async () => {
    const checkedObjects = data.list.filter(obj => obj.checked)

    const resultObject = {
      leanProductions: checkedObjects
    }

    const res = await postRequest({
      extension: ManufacturingRepository.MaterialsAdjustment.generate,
      record: JSON.stringify(resultObject)
    })
    if (res.recordId) {
      toast.success('Record Generated Successfully')
      invalidate()
      stack({
        Component: MaterialsAdjustmentForm,
        props: {
          recordId: res.recordId,
          labels: _labelsADJ,
          maxAccess: accessADJ
        },
        width: 900,
        height: 600,
        title: _labelsADJ[1]
      })
    }
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
           handleCheckedRows={() => {}}
           pageSize={50}
           paginationType='api'
           paginationParameters={paginationParameters}
           refetch={refetch}
        />
      </Grow>

      <Fixed>
        <WindowToolbar onSave={handleSubmit} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

export default GateKeeper
