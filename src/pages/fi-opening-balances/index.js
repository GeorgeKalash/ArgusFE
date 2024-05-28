import { useContext } from 'react'

import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import FiOpeningBalancesForm from './forms/FiOpeningBalancesForm'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'

const FiOpeningBalance = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FinancialRepository.FiOpeningBalance.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=`
    })

    return { ...response, _startAt: _startAt }
  }

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.FiOpeningBalance.page
  })

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.FiOpeningBalance.page,
    datasetId: ResourceIds.FiOpeningBalances
  })

  const columns = [
    {
      field: 'fiscalYear',
      headerName: _labels.fiscalYear,
      flex: 1
    },
    {
      field: 'accountRef',
      headerName: _labels.accountRef,
      flex: 1
    },
    {
      field: 'accountName',
      headerName: _labels.accountName,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: _labels.currencyName,
      flex: 1
    },
    {
      field: 'amount',
      headerName: _labels.amount,
      flex: 1
    },
    {
      field: 'plantRef',
      headerName: _labels.plantRef,
      flex: 1
    },
    {
      field: 'plantName',
      headerName: _labels.plantName,
      flex: 1
    },
    {
      field: 'baseAmount',
      headerName: _labels.baseAmount,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const popup = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: FinancialRepository.FiOpeningBalance.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  function openForm(recordId) {
    stack({
      Component: FiOpeningBalancesForm,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 600,
      height: 500,
      title: _labels.openingBalance
    })
  }

  return (
    <>
      <GridToolbar onAdd={add} maxAccess={access} />
      <Table
        columns={columns}
        gridData={data}
        rowId={['recordId']}
        onEdit={popup}
        onDelete={del}
        isLoading={false}
        pageSize={50}
        paginationParameters={paginationParameters}
        paginationType='api'
        maxAccess={access}
        refetch={refetch}
      />
    </>
  )
}

export default FiOpeningBalance
