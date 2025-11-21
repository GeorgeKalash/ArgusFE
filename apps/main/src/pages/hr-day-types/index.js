import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import DayTypesForm from './Forms/DayTypesForm'

const DayTypes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: TimeAttendanceRepository.DayTypes.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    invalidate,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: TimeAttendanceRepository.DayTypes.page,
    datasetId: ResourceIds.DayTypes
  })

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
    },
    {
      field: 'color',
      headerName: labels.color,
      flex: 1,
      type: 'colorCombo'
    },
    {
      field: 'isWorkingDay',
      headerName: labels.isWorkingDay,
      flex: 1,
      type: 'checkbox'
    }
  ]

  const add = () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: TimeAttendanceRepository.DayTypes.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: DayTypesForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 600,
      height: 300,
      title: labels.dayType
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={access} onAdd={add} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default DayTypes
