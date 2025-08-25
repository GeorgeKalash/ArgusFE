import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import OutwardReturnReasonForm from './Forms/OutwardReturnReason'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const OutwardReturnReason = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: RemittanceOutwardsRepository.OutwardReturnReason.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}`
    })

    return { ...response, _startAt: _startAt }
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
    endpointId: RemittanceOutwardsRepository.OutwardReturnReason.snapshot,
    datasetId: ResourceIds.OutwardReturnReason,
    filter: {
      filterFn: fetchWithFilter
    }
  })
  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: RemittanceOutwardsRepository.OutwardReturnReason.snapshot,
        parameters: `_filter=${filters.qry}`
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
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'correspondant',
      headerName: labels.correspondant,
      flex: 1,
      type: 'checkbox'
    },
    {
      field: 'client',
      headerName: labels.client,
      flex: 1,
      type: 'checkbox'
    },
    {
      field: 'company',
      headerName: labels.company,
      flex: 1,
      type: 'checkbox'
    },
    {
      field: 'feesStatusName',
      headerName: labels.feesStatus,
      flex: 1
    },
    {
      field: 'rateStatusName',
      headerName: labels.rateStatus,
      flex: 1
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
      Component: OutwardReturnReasonForm,
      props: {
        labels: labels,
        recordId,
        maxAccess: access
      },
      width: 600,
      height: 500,
      title: labels.OutwardReturnReason
    })
  }

  const del = async obj => {
    await postRequest({
      extension: RemittanceOutwardsRepository.OutwardReturnReason.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'RTOWRR'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default OutwardReturnReason
