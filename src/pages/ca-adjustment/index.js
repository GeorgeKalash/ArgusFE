import { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import CAadjustmentForm from './form/CAadjustmentForms'
import { formatDateDefault } from 'src/lib/date-helper'
import { getFormattedNumber } from 'src/lib/numberField-helper'

const CAadjustment = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: CashBankRepository.CAadjustment.qry,
      parameters: `_startAt=0&_params=&_pageSize=50&_sortBy=reference&_functionId=3301`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access,
    paginationParameters,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CashBankRepository.CAadjustment.qry,
    datasetId: ResourceIds.IncreaseDecreaseAdj
  })

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CAadjustment.qry
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },

    {
      field: 'dtName',
      headerName: _labels.dtName,
      flex: 1
    },

    {
      field: 'cashAccountName',
      headerName: _labels.cashAccount,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      valueGetter: ({ row }) => formatDateDefault(row?.date)
    },
    {
      field: 'amount',
      headerName: _labels.amount,
      flex: 1,
      valueGetter: ({ row }) => getFormattedNumber(row?.amount)
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    },
    {
      field: 'notes',
      headerName: _labels.notes,
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
      Component: CAadjustmentForm,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 800,
      height: 670,
      title: _labels.increaseAdj
    })
  }

  const del = async obj => {
    await postRequest({
      extension: CashBankRepository.CAadjustment.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          refetch={refetch}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default CAadjustment
