import React, { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SelfServiceRepository } from '@argus/repositories/src/repositories/SelfServiceRepository'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import SSLeaveRequestForm from './Forms/SSLeaveRequestForm'
import { AuthContext } from '@argus/shared-providers/src/providers/AuthContext'
import { useError } from '@argus/shared-providers/src/providers/error'

const SSLeaveRequest = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { user } = useContext(AuthContext)
  const employeeId = user?.employeeId

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    if (!employeeId) {
      stackError({
        message: platformLabels.notConnectedToEmployee
      })

      return { list: [], totalCount: 0, _startAt }
    }

    const response = await getRequest({
      extension: SelfServiceRepository.SSLeaveRequest.page,
      parameters: `_size=50&_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}&_employeeId=${user?.employeeId}&_sortBy=recordId`
    })

    return { ...response, _startAt }
  }

  const {
    query: { data },
    refetch,
    labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SelfServiceRepository.SSLeaveRequest.page,
    datasetId: ResourceIds.SSLeaveRequest
  })

  const columns = [
    {
      field: 'startDate',
      headerName: labels.startDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'endDate',
      headerName: labels.endDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'destination',
      headerName: labels.destination,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.statusName,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  async function openForm(recordId) {
    if (!employeeId) {
      stackError({
        message: platformLabels.notConnectedToEmployee
      })
    } else {
      stack({
        Component: SSLeaveRequestForm,
        props: {
          recordId,
          labels,
          maxAccess: access
        },
        width: 800,
        height: 550,
        title: labels.SSLeaveRequest
      })
    }
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: SelfServiceRepository.SSLeaveRequest.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
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
          paginationType='api'
          paginationParameters={paginationParameters}
          maxAccess={access}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default SSLeaveRequest
