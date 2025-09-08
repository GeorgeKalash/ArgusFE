import { useContext, useState } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import DeductionsForm from './DeductionsForm'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'

const DeductionsTab = ({ store, labels, maxAccess, salaryInfo }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const [maxSeqNo, setMaxSeqNo] = useState(0)

  async function fetchGridData() {
    const response = await getRequest({
      extension: EmployeeRepository.SalaryDetails.qry,
      parameters: `_salaryId=${recordId}&_type=2`
    })

    const maxSeq = response.list.length > 0 ? Math.max(...response.list.map(r => r.seqNo ?? 0)) : 0
    setMaxSeqNo(maxSeq)

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
      headerName: labels.deductions,
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
    openForm(obj.seqNo)
  }

  function openForm(seqNo) {
    stack({
      Component: DeductionsForm,
      props: {
        labels,
        maxAccess,
        salaryId: recordId,
        seqNumbers: { current: seqNo, maxSeqNo },
        salaryInfo: { header: salaryInfo, details: data }
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
          name='deductionTable'
          columns={columns}
          gridData={{ list: data }}
          rowId='salaryId'
          onEdit={edit}
          onDelete={del}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default DeductionsTab
