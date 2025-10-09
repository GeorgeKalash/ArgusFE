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
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { PayrollRepository } from 'src/repositories/PayrollRepository'
import FinalSettlementForm from './Form/FinalSettlementForm'

const FinalSettlement = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: PayrollRepository.FinalSettlement.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    response.list = response?.list?.map(item => ({
      ...item,
      employeeName: item?.employee?.parent.fullName || '',
    }))

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access,
    invalidate,
    filterBy
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PayrollRepository.FinalSettlement.page,
    datasetId: ResourceIds.FinalSettlement,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'fsRef',
      headerName: labels.ref,
      flex: 1
    },
    {
      field: 'employeeName',
      headerName: labels.employee,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: PayrollRepository.FinalSettlement.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  function openForm(recordId) {
    stack({
      Component: FinalSettlementForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 700,
      height: 600,
      title: labels.finalSettlement
    })
  }

  const del = async obj => {
    await postRequest({
      extension: PayrollRepository.FinalSettlement.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar labels={labels} maxAccess={access} filterBy={filterBy} onAdd={add} reportName={'PYFS'} />
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
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default FinalSettlement
