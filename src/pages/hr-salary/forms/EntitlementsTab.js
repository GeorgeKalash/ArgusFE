import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import toast from 'react-hot-toast'
import EntitlementForm from './EntitlementForm'
import { useWindow } from 'src/windows'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { getFormattedNumber } from 'src/lib/numberField-helper'
import { ControlContext } from 'src/providers/ControlContext'

const EntitlementsTab = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData() {
    const response = await getRequest({
      extension: EmployeeRepository.SalaryDetails.qry,
      parameters: `_salaryId=${recordId}&_type=1`
    })

    return response.list.map(record => ({
      ...record,
      currencyAmount: `${store.currency} ${getFormattedNumber(record.fixedAmount, 2)}`,
      pct: record?.pct ? `${parseFloat(record.pct).toFixed(2)}%` : null
    }))
  }

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.Salaries,
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.SalaryDetails.qry
  })

  const columns = [
    {
      field: 'edName',
      headerName: labels.entitlements,
      flex: 1
    },
    {
      field: 'pct',
      headerName: labels.percentage,
      flex: 1
    },
    {
      field: 'currencyAmount',
      headerName: labels.amount,
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
      Component: EntitlementForm,
      props: {
        labels,
        maxAccess,
        recordId
      },
      width: 800,
      height: 500,
      title: labels.entitlements
    })
  }

  const del = async obj => {
    await postRequest({
      extension: EmployeeRepository.SalaryDetails.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} labels={labels} />
      </Fixed>
      <Grow>
        <Table
          name='entitlementsTable'
          columns={columns}
          gridData={{ list: data }}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default EntitlementsTab
