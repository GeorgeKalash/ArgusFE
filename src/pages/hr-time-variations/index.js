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
import { TimeAttendanceRepository } from 'src/repositories/TimeAttendanceRepository'
import TimeVariatrionForm from './forms/TimeVariatrionForm'

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

    response.list = (response?.list || []).map(record => {
      const dayId = record?.dayId
      let formattedDay = ''

      if (dayId && dayId.length === 8) {
        const year = dayId.slice(0, 4)
        const month = dayId.slice(4, 6)
        const day = dayId.slice(6, 8)
        formattedDay = `${day}/${month}/${year}`
      }

      return {
        ...record,
        clockDuration: time(record?.duration),
        dayId: formattedDay
      }
    })

    return { ...response, _startAt }
  }

  function time(minutes) {
    if (minutes == 0) return '00:00'
    const absMinutes = Math.abs(minutes)
    const hours = String(Math.floor(absMinutes / 60)).padStart(2, '0')
    const mins = String(absMinutes % 60).padStart(2, '0')

    return (minutes < 0 ? '-' : '') + `${hours}:${mins}`
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'dayId',
      headerName: labels.date,
      flex: 1
    },
    {
      field: 'employeeName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'timeName',
      headerName: labels.timeCode,
      flex: 1
    },
    {
      field: 'clockDuration',
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
      field: 'damageLevelName',
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
