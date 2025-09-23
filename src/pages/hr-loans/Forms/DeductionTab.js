import Table from 'src/components/Shared/Table'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { useWindow } from 'src/windows'
import { LoanTrackingRepository } from 'src/repositories/LoanTrackingRepository'
import { Grid } from '@mui/material'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import DeductionForm from './DeductionForm'

const DeductionTab = ({ store, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const columns = [
    {
      field: 'payrollDeduction',
      headerName: labels.payrollDeduction,
      type: 'checkbox',
      flex: 1
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'typeName',
      headerName: labels.type,
      flex: 1
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    }
  ]

  async function fetchGridData() {
    const response = await getRequest({
      extension: LoanTrackingRepository.LoanDeduction.qry,
      parameters: `_loanId=${recordId}`
    })

    return response
  }

  const {
    query: { data },
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: LoanTrackingRepository.LoanDeduction.qry,
    datasetId: ResourceIds.Loans,
    enabled: !!recordId
  })

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: DeductionForm,
      props: {
        labels,
        store,
        maxAccess: access,
        recordId
      },
      width: 600,
      height: 500,
      title: labels.Deduction
    })
  }
  const deductedAmount = data?.list.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0
  const remainingBalance = (store.loanAmount || 0) - deductedAmount

  const del = async obj => {
    await postRequest({
      extension: LoanTrackingRepository.LoanDeduction.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar disableAdd={!store.isClosed} onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          name='deductionTable'
          columns={columns}
          onDelete={store.isClosed && del}
          gridData={data}
          rowId={'loanId'}
          onEdit={edit}
          pageSize={50}
          pagination={false}
          maxAccess={access}
        />
      </Grow>
      <Fixed>
        <Grid container sx={{ p: 2 }} spacing={2}>
          <Grid item xs={4}>
            <CustomNumberField name='loanAmount' label={labels.loanAmount} value={store.loanAmount} readOnly />
          </Grid>
          <Grid item xs={4}>
            <CustomNumberField name='deductedAmount' label={labels.deductedAmount} value={deductedAmount} readOnly />
          </Grid>
          <Grid item xs={4}>
            <CustomNumberField
              name='remainingBalance'
              label={labels.remainingBalance}
              value={remainingBalance}
              readOnly
            />
          </Grid>
        </Grid>
      </Fixed>
    </VertLayout>
  )
}

export default DeductionTab
