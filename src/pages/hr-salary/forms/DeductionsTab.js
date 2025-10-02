import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import DeductionsForm from './DeductionsForm'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { useInvalidate } from 'src/hooks/resource'

const DeductionsTab = ({ store, labels, maxAccess, salaryInfo, data }) => {
  const { postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const maxSeqNo = data?.length > 0 ? Math.max(...data.map(r => r.seqNo ?? 0)) : 0

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

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.SalaryDetails.qry
  })

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
        salaryId: store?.recordId,
        seqNumbers: { current: seqNo, maxSeqNo },
        salaryInfo: { header: salaryInfo, details: data }
      },
      width: 800,
      height: 500,
      title: labels.deduction
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
