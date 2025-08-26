import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import FeeScheduleMapForm from './forms/FeeScheduleMapForm'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const FeeScheduleMap = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: RemittanceOutwardsRepository.FeeScheduleOutwards.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    filterBy,
    refetch,
    invalidate,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    extension: RemittanceOutwardsRepository.FeeScheduleOutwards.page,
    datasetId: ResourceIds.FeeScheduleMap,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'corRef',
      headerName: labels.corRef,
      flex: 1
    },
    {
      field: 'corName',
      headerName: labels.corName,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'countryName',
      headerName: labels.country,
      flex: 1
    },
    {
      field: 'dispersalModeName',
      headerName: labels.dispersalMode,
      flex: 1
    },
    {
      field: 'scheduleName',
      headerName: labels.schedule,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  const del = async obj => {
    await postRequest({
      extension: RemittanceOutwardsRepository.FeeScheduleOutwards.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(record) {
    stack({
      Component: FeeScheduleMapForm,
      props: {
        labels,
        record,
        maxAccess: access,
        recordId: record
          ? String(record.corId) +
            String(record.currencyId) +
            String(record.countryId) +
            String(record.dispersalMode) +
            String(record.functionId)
          : null
      },
      width: 700,
      height: 460,
      title: labels.fsm
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          labels={labels}
          onAdd={add}
          maxAccess={access}
          reportName={'RTFSO'}
          filterBy={filterBy}
          hasSearch={false}
        />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          refetch={refetch}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default FeeScheduleMap
