import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { LoanTrackingRepository } from '@argus/repositories/src/repositories/LoanTrackingRepository'
import { Grid } from '@mui/material'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import DeductionForm from '@argus/shared-ui/src/components/Shared/Forms/DeductionForm'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const DeductionTab = ({ store, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
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

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: LoanTrackingRepository.LoanDeduction.page,
      parameters: `_loanId=${recordId}&_pageSize=${_pageSize}&_startAt=${_startAt}`
    })

    return { ...response, _startAt }
  }

  const {
    query: { data },
    access,
    invalidate,
    paginationParameters,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: LoanTrackingRepository.LoanDeduction.page,
    datasetId: ResourceIds.Loans,
    enabled: !!recordId
  })

  const deductedAmount = parseFloat(data?.list?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0).toFixed(2)
  const remainingBalance = parseFloat((store.loanAmount || 0) - deductedAmount).toFixed(2)

  const add = () => openForm()

  const edit = obj => openForm(obj.recordId)

  function openForm(recordId) {
    stack({
      Component: DeductionForm,
      props: {
        labels,
        store,
        maxAccess: access,
        loanAmount: store.loanAmount,
        recordId
      },
      width: 600,
      height: 500,
      title: labels.Deduction
    })
  }

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
          gridData={data}
          rowId='recordId'
          onEdit={edit}
          onDelete={store.isClosed && del}
          actionCondition={(row, actionType) => {
            if (actionType === 'delete') {
              return row.payrollDeduction === false
            }

            return true
          }}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
      <Fixed>
        <Grid container sx={{ p: 2 }} spacing={2}>
          <Grid item xs={4}>
            <CustomNumberField
              name='loanAmount'
              label={labels.loanAmount}
              value={parseFloat(store.loanAmount).toFixed(2)}
              readOnly
            />
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
