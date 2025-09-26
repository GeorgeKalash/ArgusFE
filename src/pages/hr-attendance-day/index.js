import { useContext } from 'react'
import { format } from 'date-fns'
import dayjs from 'dayjs'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { TimeAttendanceRepository } from 'src/repositories/TimeAttendanceRepository'
import Approvals from 'src/components/Shared/Approvals'
import { useWindow } from 'src/windows'
import { SystemFunction } from 'src/resources/SystemFunction'

const AttendanceDay = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels,
    filterBy,
    paginationParameters,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: TimeAttendanceRepository.AttendanceDay.qry,
    datasetId: ResourceIds.AttendanceDay,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const todayFormatted = format(new Date(), 'yyyyMMdd')

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 30, params } = options

    const response = await getRequest({
      extension: TimeAttendanceRepository.AttendanceDay.qry,
      parameters: `_filter=&_size=${_pageSize}&_startAt=${_startAt}&_params=${
        params || `6|${todayFormatted}^7|${todayFormatted}`
      }&_sortBy=dayId`
    })

    if (response && response?.list) {
      response.list = response?.list?.map(item => ({
        ...item,
        employee: `<div style="text-align:center;">
             <b>${item.employeeName}</b><br>
             ${dayjs(item.dayId).format('DD/MM/YYYY')}<br>
             ${item.departmentName}<br>
             ${item.positionName}<br>
             ${item.branchName}
           </div>`,
        timeVariations: `<div style="text-align:center;">
                   ${item?.variationsList
                     ?.map(tv => {
                       if (tv.timeCodeName) {
                         let text =
                           tv.timeCode === 20 || tv.timeCode === 41
                             ? tv.timeCodeName
                             : `${tv.timeCodeName}: ${tv.duration} ${labels.minutes}`

                         return `<a href="#" data-id="${tv.variationId}" 
                                   class="approval-link" 
                                   style="color: black; text-decoration: underline;">
                                   ${text}
                                 </a>`
                       }

                       return ''
                     })
                     .join('<br>')}
                 </div>`,
        effectiveTime: item?.scheduleList?.[0]?.effectiveTime
      }))
    }

    return { ...response, _startAt: _startAt }
  }

  const HtmlCellRenderer = props => {
    const { value } = props

    const handleClick = e => {
      if (e.target.tagName === 'A' && e.target.classList.contains('approval-link')) {
        e.preventDefault()
        const variationId = e.target.getAttribute('data-id')
        openApproval(variationId, SystemFunction.TimeVariation)
      }
    }

    return <span dangerouslySetInnerHTML={{ __html: value }} onClick={handleClick} style={{ cursor: 'pointer' }} />
  }

  const openApproval = (recordId, functionId) => {
    stack({
      Component: Approvals,
      props: {
        recordId,
        functionId
      }
    })
  }

  const columns = [
    {
      field: 'employee',
      headerName: labels.employeeName,
      flex: 1,
      cellRenderer: HtmlCellRenderer,
      autoHeight: true
    },
    {
      field: 'schedule',
      headerName: labels.schedule,
      flex: 1,
      centered: true
    },
    {
      field: 'attendance',
      headerName: labels.attendance,
      flex: 1
    },
    {
      field: 'effectiveTime',
      headerName: labels.effectiveTime,
      flex: 1
    },
    {
      field: 'timeVariations',
      headerName: labels.timeVariations,
      flex: 1,
      autoHeight: true,
      cellRenderer: HtmlCellRenderer
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar maxAccess={access} reportName={'TAAD'} filterBy={filterBy} hasSearch={false} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default AttendanceDay
