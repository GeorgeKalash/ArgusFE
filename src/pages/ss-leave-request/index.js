import React, { useContext } from 'react'
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
import { SelfServiceRepository } from 'src/repositories/SelfServiceRepository'
import GridToolbar from 'src/components/Shared/GridToolbar'
import SSLeaveRequestForm from './Forms/SSLeaveRequestForm'
import { useError } from 'src/error'
import { AuthContext } from 'src/providers/AuthContext'

const SSLeaveRequest = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { user } = useContext(AuthContext)

  function formatDotNetDate(dotNetDateString) {
    if (!dotNetDateString) return ''
    const match = dotNetDateString.match(/\d+/)
    if (!match) return ''
    const date = new Date(parseInt(match[0], 10))

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    if (!user?.employeeId) {
      stackError({
        message: platformLabels.notConnectedToEmployee
      })

      return { list: [], totalCount: 0, _startAt }
    }

    const response = await getRequest({
      extension: SelfServiceRepository.SSLeaveRequest.page,
      parameters: `_size=50&_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}&_employeeId=${user?.employeeId}&_sortBy=recordId`
    })

    response.list = response?.list?.map(item => ({
      ...item,
      startDateFormatted: formatDotNetDate(item?.startDate),
      endDateFormatted: formatDotNetDate(item?.endDate)
    }))

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
      field: 'startDateFormatted',
      headerName: labels.startDate,
      flex: 1
    },
    {
      field: 'endDateFormatted',
      headerName: labels.endDate,
      flex: 1
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

  function openForm(recordId) {
    if (!user?.employeeId) {
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
