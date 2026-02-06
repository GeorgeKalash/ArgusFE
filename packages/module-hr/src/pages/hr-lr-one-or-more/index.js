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
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { LoanManagementRepository } from '@argus/repositories/src/repositories/LoanManagementRepository'
import { LeaveForm } from '@argus/shared-ui/src/components/Shared/LeaveForm'

const LeaveRequestOneDayOrMore = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const parseDotNetDate = dateString => {
    if (!dateString) return null
    const match = dateString.match(/\d+/)

    return match ? new Date(parseInt(match[0], 10)) : null
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: LoanManagementRepository.LeaveRequest.page,
      parameters: `_size=30&_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}&_sortBy=recordId&_multiDayLeave=2`
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
    filterBy,
    refetch,
    labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: LoanManagementRepository.LeaveRequest.page,
    datasetId: ResourceIds.LeaveRequestODOM,
    filter: {
      filterFn: fetchWithFilter,
      default: { _multiDayLeave: 2 }
    }
  })
  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: LoanManagementRepository.LeaveRequest.snapshot,
        parameters: `_filter=${filters.qry}&_multiDayLeave=2`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

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
      Component: LeaveForm,
      props: {
        recordId
      }
    })
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: LoanManagementRepository.LeaveRequest.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'LMLR'} filterBy={filterBy} />
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

export default LeaveRequestOneDayOrMore
