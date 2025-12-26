import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useContext } from 'react'
import toast from 'react-hot-toast'
import PayrollListForm from '@argus/shared-ui/src/components/Shared/Forms/PayrollListForm'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Table from '@argus/shared-ui/src/components/Shared/Table'

const PayList = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

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
    endpointId: PayrollRepository.Payroll.page,
    datasetId: ResourceIds.PayrollHeader,
    filter: {
      filterFn: fetchWithFilter
    }
  })

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
      field: 'fiscalYear',
      headerName: labels.fiscalYear,
      flex: 1
    },
    {
      field: 'payDate',
      headerName: labels.payDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'payDescription',
      headerName: labels.payDescription,
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
      field: 'taStartDate',
      headerName: labels.taStartDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'taEndDate',
      headerName: labels.taEndDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: PayrollRepository.Payroll.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: PayrollRepository.Payroll.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.PayrollList,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  async function openForm(recordId) {
    stack({
      Component: PayrollListForm,
      props: {
        recordId
      }
    })
  }

  const del = async obj => {
    await postRequest({
      extension: PayrollRepository.Payroll.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'PYHE'} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          refetch={refetch}
          onDelete={del}
          deleteConfirmationType={'strict'}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default PayList
