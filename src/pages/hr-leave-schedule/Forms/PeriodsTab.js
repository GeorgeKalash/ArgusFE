import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { LoanManagementRepository } from 'src/repositories/LoanManagementRepository'
import PeriodsForm from './PeriodsForm'
import { useWindow } from 'src/windows'

const PeriodsTab = ({ store, labels, maxAccess, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { stack } = useWindow()

  async function fetchGridData() {
    return await getRequest({
      extension: LoanManagementRepository.LeavePeriod.qry,
      parameters: `&_lsId=${recordId}`
    })
  }

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.LeaveSchedule,
    queryFn: fetchGridData,
    endpointId: LoanManagementRepository.LeavePeriod.qry
  })

  const columns = [
    {
      field: 'startAt',
      headerName: labels.startAt,
      flex: 1
    },
    {
      field: 'activationName',
      headerName: labels.activationName,
      flex: 1
    },
    {
      field: 'periodName',
      headerName: labels.period,
      flex: 1
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'accumulationName',
      headerName: labels.accumulation,
      flex: 1
    },
    {
      field: 'maxAmount',
      headerName: labels.maxAmount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'carryOverName',
      headerName: labels.carryOverName,
      flex: 1
    },
    {
      field: 'carryOverMax',
      headerName: labels.carryOverMax,
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
      Component: PeriodsForm,
      props: {
        labels,
        recordId: recordId,
        seqNo: obj?.seqNo,
        maxAccess,
        window
      },
      width: 500,
      height: 500,
      title: labels.period
    })
  }

  const del = async obj => {
    await postRequest({
      extension: LoanManagementRepository.LeavePeriod.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='periods'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          pageSize={50}
          onEdit={edit}
          onDelete={del}
          pagination={false}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default PeriodsTab
