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
import { useAuth } from 'src/hooks/useAuth'
import { SSLeaveRequestForm } from './Forms/SSLeaveRequestForm'
import GridToolbar from 'src/components/Shared/GridToolbar'

const SSLeaveRequest = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { user } = useAuth()

  const parseDotNetDate = dateString => {
    if (!dateString) return null
    const match = dateString.match(/\d+/)

    return match ? new Date(parseInt(match[0], 10)) : null
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    if (!user?.employeeId) return { list: [], totalCount: 0, _startAt }

    const response = await getRequest({
      extension: SelfServiceRepository.SSLeaveRequest.page,
      parameters: `_size=30&_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}&_employeeId=${user?.employeeId}&_sortBy=recordId`
    })

    if (response && response?.list) {
      response.list = response.list.map(item => {
        const endDate = parseDotNetDate(item?.endDate)
        const actualReturnDate = parseDotNetDate(item?.actualReturnDate)

        let lateDays = ''
        if (actualReturnDate && endDate) {
          const diffInMs = endDate - actualReturnDate
          lateDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1
        }

        return { ...item, lateDays }
      })
    }

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
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
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
      field: 'actualReturnDate',
      headerName: labels.actualReturnDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'leaveDays',
      headerName: labels.days,
      flex: 1,
      type: 'number'
    },
    {
      field: 'lateDays',
      headerName: labels.lateDays,
      flex: 1
    },
    {
      field: 'ltName',
      headerName: labels.leaveType,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.statusName,
      flex: 1
    },
    {
      field: 'releaseStatus',
      headerName: labels.statusRelease,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wipName,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
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
          deleteConfirmationType={'strict'}
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
