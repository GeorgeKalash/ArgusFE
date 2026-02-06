import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import toast from 'react-hot-toast'
import EntitlementForm from './EntitlementForm'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { getFormattedNumber } from '@argus/shared-domain/src/lib/numberField-helper'

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
        seqNumbers: { current: obj?.seqNo, maxSeqNo: store?.maxSeqNo },
        salaryInfo: { header: salaryInfo, details: data },
        fixedAmount: obj?.fixedAmount ? getFormattedNumber(obj.fixedAmount, 2) : 0,
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
