import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RemittanceOutwardsRepository } from '@argus/repositories/src/repositories/RemittanceOutwardsRepository'
import FeeScheduleInwardsMapForm from './Forms/FeeScheduleInwardsMapForm'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'

const FeeScheduleInwardsMap = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: RemittanceOutwardsRepository.FeeScheduleInwards.page,
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
    extension: RemittanceOutwardsRepository.FeeScheduleInwards.page,
    datasetId: ResourceIds.FeeScheduleInwardsMap,
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
      field: 'dispersalModeName',
      headerName: labels.dispersalMode,
      flex: 1
    },
    {
      field: 'scheduleName',
      headerName: labels.schedule,
      flex: 1
    },
    {
      field: 'feePayerName',
      headerName: labels.feePayer,
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
      extension: RemittanceOutwardsRepository.FeeScheduleInwards.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(record) {
    stack({
      Component: FeeScheduleInwardsMapForm,
      props: {
        labels,
        record,
        maxAccess: access,
        recordId: record ? String(record.corId) + String(record.dispersalMode) : null
      },
      width: 700,
      height: 350,
      title: labels.fsim
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          labels={labels}
          onAdd={add}
          maxAccess={access}
          reportName={'RTFSI'}
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

export default FeeScheduleInwardsMap
