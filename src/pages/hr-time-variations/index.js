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
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { ControlContext } from 'src/providers/ControlContext'
import TimeVariatrionForm from './Windows/TimeVariatrionForm'
import { TimeAttendanceRepository } from 'src/repositories/TimeAttendanceRepository'

export default function TimeVariation() {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

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
    endpointId: TimeAttendanceRepository.TimeVariation.page,
    datasetId: ResourceIds.TimeVariation,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry)
      return await getRequest({
        extension: TimeAttendanceRepository.TimeVariation.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: TimeAttendanceRepository.TimeVariation.page,
      parameters: `_startAt=${_startAt}&_size=${_pageSize}&_sortBy=recordId&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'dayIdString',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'employeeName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'timeCodeString',
      headerName: labels.timeCode,
      flex: 1
    },
    {
      field: 'clockDurationString',
      headerName: labels.clockDuration,
      flex: 1
    },
    {
      field: 'duration',
      headerName: labels.duration,
      flex: 1,
      type: 'number'
    },
    {
      field: 'damageLevelString',
      headerName: labels.damageLevel,
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
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: TimeVariatrionForm,
      props: {
        recordId
      }
    })
  }

  const del = async obj => {
    await postRequest({
      extension: TimeAttendanceRepository.TimeVariation.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'TATV'} filterBy={filterBy} />
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
          deleteConfirmationType={'strict'}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}
