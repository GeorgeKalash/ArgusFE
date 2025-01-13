import React, { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CostAllocationRepository } from 'src/repositories/CostAllocationRepository'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ControlContext } from 'src/providers/ControlContext'
import GridToolbar from 'src/components/Shared/GridToolbar'
import TransactionForm from './TransactionForm'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

const TransactionTab = ({ store, labels, access }) => {
  const { platformLabels } = useContext(ControlContext)
  const { recordId, isPosted, isClosed } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [baseAmounts, setBaseAmounts] = useState(0)
  const { stack } = useWindow()
  const [maxSeqNo, setMaxSeqNo] = useState(0)

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CostAllocationRepository.TrxCostType.qry,
    datasetId: ResourceIds.PuCostAllocation,
    enabled: Boolean(recordId)
  })

  const columns = [
    {
      field: 'costTypeName',
      headerName: labels.costType,
      flex: 1
    },
    {
      field: 'baseAmount',
      headerName: labels.baseAmount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'accountRef',
      headerName: labels.accountRef,
      flex: 1
    },
    {
      field: 'accountName',
      headerName: labels.accountName,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1,
      type: 'number'
    }
  ]

  async function fetchGridData() {
    return await getRequest({
      extension: CostAllocationRepository.TrxCostType.qry,
      parameters: `_caId=${recordId}`
    })
  }

  const del = async obj => {
    await postRequest({
      extension: CostAllocationRepository.TrxCostType.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(obj) {
    stack({
      Component: TransactionForm,
      props: {
        labels: labels,
        recordId: obj?.caId,
        caId: recordId,
        seqNo: obj?.seqNo ?? maxSeqNo,
        maxAccess: access
      },
      width: 600,
      height: 400,
      title: labels.transaction
    })
  }

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    openForm()
  }

  useEffect(() => {
    if (data) {
      let totalBaseAmounts = 0
      let maxSeq = 0

      data.list = data.list.map(item => {
        totalBaseAmounts += item.baseAmount
        maxSeq = Math.max(maxSeq, item.seqNo)

        return item
      })

      setBaseAmounts(totalBaseAmounts)
      setMaxSeqNo(maxSeq + 1)
    }
  }, [data])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={access} labels={labels} onAdd={add} disableAdd={isPosted || isClosed} />
      </Fixed>
      <Grow>
        <Table
          name='transactionTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          onDelete={isPosted || isClosed ? null : del}
          onEdit={isPosted || isClosed ? null : edit}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
      <Fixed>
        <Grid container justifyContent='flex-end' sx={{ p: 2 }}>
          <Grid item xs={3}>
            <CustomNumberField name='baseAmounts' label={labels.totalBaseAmounts} value={baseAmounts} readOnly />
          </Grid>
        </Grid>
      </Fixed>
    </VertLayout>
  )
}

export default TransactionTab
