import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import FiscalPeriodList from './forms/FiscalPeriodList'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import PayPeriodForm from './forms/PayPeriodForm'
import toast from 'react-hot-toast'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function PayPeriods () {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: PayrollRepository.FiscalYear.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }
  
  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PayrollRepository.FiscalYear.page,
    datasetId: ResourceIds.PayPeriod
  })

  const columns = [
    {
      field: 'fiscalYear',
      headerName: labels.year,
      flex: 1
    },
    {
      field: 'startDate',
      headerName: labels.from,
      flex: 1,
      type: 'date'
    },
    {
      field: 'endDate',
      headerName: labels.to,
      flex: 1,
      type: 'date'
    }
  ]

  const add = async () => {
    await openForm()
  }

  const edit = obj => {
    openForm(obj?.fiscalYear)
  }

  async function openForm(fiscalYear) {
    stack({
      Component: fiscalYear ? FiscalPeriodList : PayPeriodForm,
      props: {
        fiscalYear,
        labels,
        maxAccess: access
      },
      height: fiscalYear ? 650 : 450,
      width: fiscalYear ? 1000 : 700,
      title: labels.payPeriods,
      nextToTitle: fiscalYear ? ` - ${fiscalYear}` : ''
    })
  }

  const del = async obj => {
    await postRequest({
      extension: PayrollRepository.FiscalYear.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          name='year'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          pageSize={50}
          refetch={refetch}
          onEdit={edit}
          onDelete={del}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}
