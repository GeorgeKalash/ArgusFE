import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { CommonContext } from '@argus/shared-providers/src/providers/CommonContext'
import WeekDaysBatchForm from '@argus/shared-ui/src/components/Shared/Forms/WeekDaysBatchForm'
import { Box, IconButton } from '@mui/material'
import Icon from '@argus/shared-core/src/@core/components/icon'

export default function WeekDaysTab({ recordId, labels, maxAccess }) {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { getAllKvsByDataset } = useContext(CommonContext)
 
  async function getWeekDays() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.WEEK_DAY,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  function formatDuration(duration, firstIn, lastOut) {
    let durationMins = parseInt(duration, 10)
    let hours = Math.floor(durationMins / 60)
    let mins = durationMins % 60

    if (durationMins < 1440 && firstIn !== lastOut) return String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0')
    else if (firstIn === lastOut && firstIn !== '00:00') return '24:00'
    else return '00:00'
}

  const fetchGridData = async () => {
    const [weekDays, response] = await Promise.all([
        getWeekDays(),
        getRequest({
        extension: TimeAttendanceRepository.ScheduleDay.qry,
        parameters: `_scId=${recordId}`
        })
    ])

     const weekDaysMap = Object.fromEntries(
        weekDays.map(day => [Number(day?.key), day?.value])
    )

    const modifiedList = (response?.list || []).map(item => ({
        ...item,
        dowName: weekDaysMap[item.dow] ||  null,
        duration: formatDuration(item.duration, item.firstIn, item.lastOut)
    }))

    return {list: modifiedList || []}
  }

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: Boolean(recordId),
    endpointId: TimeAttendanceRepository.ScheduleDay.qry,
    datasetId: ResourceIds.AttendanceSchedule
  })

  const columns = [
    {
      field: 'dowName',
      headerName: labels.dayOfWeek,
      flex: 1
    },
    {
      field: 'firstIn',
      headerName: labels.firstIn,
      flex: 1
    },
    {
      field: 'lastOut',
      headerName: labels.lastOut,
      flex: 1
    },
    {
      field: 'duration',
      headerName: labels.duration,
      flex: 1,
    },
    {
      field: 'Batch',
      headerName: labels.batch,
      flex: 1,
      cellRenderer: row => (
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <IconButton size='small' onClick={() => openForm(row.data, 'newMode')}>
            <Icon icon='mdi:application-edit-outline' fontSize={18} />
          </IconButton>
        </Box>
      )
    }
  ]

  const edit = (obj) => {
    openForm(obj)
  }

  const openForm = (obj, mode) => {
      stack({
        Component: WeekDaysBatchForm,
        props: {
          labels,
          maxAccess,
          scheduleId: recordId,
          dayId: obj?.dow,
          mode,
          invalidate
        },
        width: 600,
        height: 450,
        title: labels.breakOfDay,
        nextToTitle:` - ${obj?.dowName}`
      })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data ? data : { list: [] }}
          rowId={['recordId']}
          onEdit={edit}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

