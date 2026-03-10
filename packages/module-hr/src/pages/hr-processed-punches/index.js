import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import ConfirmationDialog from '@argus/shared-ui/src/components/ConfirmationDialog'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const HrProcessedPunches = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels,
    paginationParameters,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: TimeAttendanceRepository.PendingPunches.qry,
    datasetId: ResourceIds.ProcessedPunches
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: TimeAttendanceRepository.PendingPunches.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=1|9`
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'employeeRef',
      headerName: labels.employeeRef,
      flex: 1
    },
    {
      field: 'employeeName',
      headerName: labels.employeeName,
      flex: 1
    },
    {
      field: 'clockStamp',
      headerName: labels.date,
      flex: 1,
      type: 'dateTime'
    },
    {
      field: 'udid',
      headerName: labels.device,
      flex: 1
    },
    {
      field: 'ppTypeName',
      headerName: labels.type,
      flex: 1
    }
  ]

  const actions = [
    {
      key: 'Reset',
      condition: true,
      onClick: () => {
        postRequest({
          extension: TimeAttendanceRepository.ProcessedShiftPunches.retry,
          parameters: ''
        }).then(() => {
          confirmation(platformLabels.ServiceStarted)
        })
      }
    }
  ]

  function confirmation(dialogText) {
    stack({
      Component: ConfirmationDialog,
      props: {
        DialogText: dialogText,
        fullScreen: false,
        close: true,
        okButtonAction: refetch
      },
      width: 400,
      height: 150,
      expandable: false,
      refresh: false,
      draggable: false
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar actions={actions} maxAccess={access} onAdd={false} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
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

export default HrProcessedPunches
