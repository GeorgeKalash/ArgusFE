import React, { useContext, useEffect, useRef } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { CostAllocationRepository } from '@argus/repositories/src/repositories/CostAllocationRepository'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useInvalidate, useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import TransactionForm from '@argus/shared-ui/src/components/Shared/Forms/PuTransactionForm'

const TransactionTab = ({ store, labels, access, setStore }) => {
  const { platformLabels } = useContext(ControlContext)
  const { recordId, isClosed } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const latestListRef = useRef([])

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
    saveTRX(data.list.filter(x => x.seqNo !== obj.seqNo))

    toast.success(platformLabels.Deleted)
  }

  const invalidateOuterGrid = useInvalidate({
    endpointId: CostAllocationRepository.PuCostAllocations.page
  })

  async function saveTRX(data) {
    const baseAmount = data?.reduce((curSum, item) => {
      return curSum + parseFloat(item.baseAmount) || 0
    }, 0)

    await postRequest({
      extension: CostAllocationRepository.PuCostAllocations.set,
      record: JSON.stringify({ ...store?.result, baseAmount })
    })

    setStore(prevStore => ({
      ...prevStore,
      result: { ...prevStore?.result, baseAmount }
    }))
    invalidateOuterGrid()

    return true
  }

  useEffect(() => {
    latestListRef.current = data?.list ?? []
  }, [data])

  async function onSubmit(obj) {
    const list = latestListRef.current || []

    const i = list.findIndex(x => x.seqNo === obj.seqNo)
    let newData

    if (i > -1) {
      const next = list.slice()
      next[i] = obj
      newData = next
    } else {
      newData = [...list, obj]
    }

    obj.seqNo = obj.seqNo ?? list?.reduce((acc, item) => Math.max(acc, item.seqNo), 0) + 1

    const res = await postRequest({
      extension: CostAllocationRepository.TrxCostType.set,
      record: JSON.stringify(obj)
    })

    saveTRX(newData)

    return res
  }

  function openForm(obj) {
    stack({
      Component: TransactionForm,
      props: {
        labels,
        recordId: obj?.caId,
        caId: recordId,
        seqNo: obj?.seqNo,
        onSubmit,
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

  const baseAmounts = data ? data.list.reduce((acc, item) => acc + item.baseAmount, 0) : 0

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={access} labels={labels} onAdd={add} disableAdd={isClosed} />
      </Fixed>
      <Grow>
        <Table
          name='transactionTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          onDelete={isClosed ? null : del}
          onEdit={isClosed ? null : edit}
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
