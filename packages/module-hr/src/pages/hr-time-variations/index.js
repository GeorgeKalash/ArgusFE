import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import { Box, IconButton } from '@mui/material'
import Image from 'next/image'
import editTime from '@argus/shared-ui/src/components/images/TableIcons/editTime.png'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import OverrideForm from '@argus/shared-ui/src/components/Shared/Forms/OverrideForm'
import TimeVariatrionForm from '@argus/shared-ui/src/components/Shared/Forms/TimeVariatrionForm'

export default function TimeVariation() {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const {
    query: { data },
    labels,
    filterBy,
    paginationParameters,
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
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: TimeAttendanceRepository.TimeVariation.page,
      parameters: `_startAt=${_startAt}&_size=${_pageSize}&_sortBy=recordId&_params=${params || ''}`
    })

    response.list = (response?.list || []).map(record => ({
      ...record,
      clockDuration: time(record?.duration)
    }))

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
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
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
      headerName: labels.damage,
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
    },
    {
      field: '',
      flex: 0.6,
      cellRenderer: row => (
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <IconButton
            size='small'
            onClick={() => {
              stack({
                Component: OverrideForm,
                props: {
                  recordId: row?.data?.recordId,
                  labels,
                  maxAccess: access
                },
                height: 550,
                width: 500,
                title: labels.overrideTimeVariations
              })
            }}
          >
            {[20, 21, 41].includes(row?.data?.timeCode) && row?.data?.status != -1 && (
              <Image src={editTime} alt={platformLabels.History} width={18} height={18} />
            )}
          </IconButton>
        </Box>
      )
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

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'TATV'} filterBy={filterBy} hasSearch={false} />
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
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}
