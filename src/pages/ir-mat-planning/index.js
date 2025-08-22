import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'
import MatPlaningForm from './Forms/matPlaningForm'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const MatPlaning = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: IVReplenishementRepository.MatPlanning.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    filterBy,
    paginationParameters,
    invalidate,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: IVReplenishementRepository.MatPlanning.page,
    datasetId: ResourceIds.MaterialReqPlannings,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: IVReplenishementRepository.MatPlanning.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const columns = [
    {
      field: 'dtRef',
      headerName: labels.documentType,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: labels.releaseStatus,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wip,
      flex: 1
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: IVReplenishementRepository.MatPlanning.del,
      record: JSON.stringify(obj)
    })

    toast.success(platformLabels.Deleted)
    invalidate()
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.MRP,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  function openForm(recordId) {
    stack({
      Component: MatPlaningForm,
      props: {
        labels,
        recordId,
        access
      },
      width: 1300,
      height: 600,
      title: labels?.materialRequestPlaning
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'IRMPL'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          deleteConfirmationType={'strict'}
          paginationType='api'
          refetch={refetch}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default MatPlaning
