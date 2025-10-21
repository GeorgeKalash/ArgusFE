import { useContext, useState } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import toast from 'react-hot-toast'
import EntitlementForm from './EntitlementForm'
import { useWindow } from 'src/windows'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { useInvalidate } from 'src/hooks/resource'

const EntitlementsTab = ({ store, labels, maxAccess, salaryInfo, data, refetchSalaryTab }) => {
  const { postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.SalaryDetails.qry
  })

  const columns = [
    {
      field: 'edName',
      headerName: labels.entitlements,
      flex: 1
    },
    {
      field: 'concatenatedPct',
      headerName: labels.pct,
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
    openForm(obj)
  }

  function openForm(obj) {
    stack({
      Component: EntitlementForm,
      props: {
        labels,
        maxAccess,
        salaryId: store?.recordId,
        seqNumbers: { current: obj?.seqNo, maxSeqNo: store?.maxSeqNo },
        salaryInfo: { header: salaryInfo, details: data },
        fixedAmount: obj?.fixedAmount ? (Math.trunc(obj.fixedAmount * 100) / 100).toFixed(2) : 0,
        refetchSalaryTab
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
    refetchSalaryTab.current = true
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
          gridData={{ list: data?.filter(record => record.type == 1) }}
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

export default EntitlementsTab
