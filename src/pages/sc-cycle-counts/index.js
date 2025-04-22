import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'
import { useWindow } from 'src/windows'
import { SCRepository } from 'src/repositories/SCRepository'
import CycleCountsWindow from './Windows/CycleCountsWindow'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const CycleCounts = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: SCRepository.StockCount.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: SCRepository.StockCount.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const {
    query: { data },
    labels: _labels,
    access,
    invalidate,
    refetch,
    filterBy,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SCRepository.StockCount.qry,
    datasetId: ResourceIds.StockCounts,
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
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: _labels.workInProgress,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'plantName',
      headerName: _labels.plant,
      flex: 1
    },
    {
      field: 'notes',
      headerName: _labels.notes,
      flex: 1
    },
    {
      field: 'clientName',
      headerName: _labels.client,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: SCRepository.StockCount.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.StockCount,
    action: openForm,
    hasDT: false
  })

  const add = async () => {
    await proxyAction()
  }

  async function openCycleCountsWindow(plantId, recordId) {
    stack({
      Component: CycleCountsWindow,
      props: {
        labels: _labels,
        recordId,
        plantId,
        maxAccess: access
      },
      width: 650,
      height: 750,
      title: _labels.cycleCounts
    })
  }

  async function openForm(recordId) {
    const plantId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'plantId')?.value)

    openCycleCountsWindow(plantId, recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar labels={_labels} onAdd={add} maxAccess={access} reportName={'SCHDR'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
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

export default CycleCounts
