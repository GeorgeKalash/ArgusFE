import { useContext, useRef } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ScheduleWindow from './window/ScheduleWindow'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import { Grid } from '@mui/material'
import Employees from './forms/EmployeesForm'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { useError } from '@argus/shared-providers/src/providers/error'

export default function Schedules(){
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const scheduleId = useRef(null)

  const {
    query: { data },
    labels,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: TimeAttendanceRepository.Schedule.page,
    datasetId: ResourceIds.AttendanceSchedule
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options
    const response = await getRequest({
      extension: TimeAttendanceRepository.Schedule.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    const list = response?.list?.map(item => ({ ...item, checked: false })) || []

    return {
      list,
      _startAt,
      count: list.length
    }
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    }
  ]

  const del = async obj => {
    if (obj.recordId == scheduleId.current) scheduleId.current = null
    await postRequest({
      extension: TimeAttendanceRepository.Schedule.del,
      record: JSON.stringify(obj)
    })

    toast.success(platformLabels.Deleted)
    invalidate()
  }

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: ScheduleWindow,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 800,
      height: 500,
      title: labels.schedule
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openEmployeesSchedule() {
    if (!scheduleId.current){
      stackError({ message: labels.noSchedule })

      return
    }

    stack({
      Component: Employees,
      props: {
        labels,
        maxAccess: access,
        scheduleId: scheduleId.current
      },
      width: 850,
      height: 650,
      title: labels.employee
    })
  }
  
  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access}  leftSection={
            <Grid item xs={3}>
                  <CustomButton
                    label={labels.employee}
                    onClick={openEmployeesSchedule}
                    tooltipText={labels.employee}
                  />
            </Grid>
          }/>
      </Fixed>
      <Grow>
        <Table
          name='scheduleTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationType='api'
          refetch={refetch}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          maxAccess={access}
          rowSelection='single'
          showCheckboxColumn={true}
          handleCheckboxChange={row => scheduleId.current = row?.checked ? row?.recordId : null}
        />
      </Grow>
    </VertLayout>
  )
}
