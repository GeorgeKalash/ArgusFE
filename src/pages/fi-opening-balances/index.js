import { useState, useContext } from 'react'
import { Box } from '@mui/material'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import FiOpeningBalancesWindow from './Windows/FiOpeningBalancesWindow'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

const FiOpeningBalance = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [windowOpen, setWindowOpen] = useState(false)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: FinancialRepository.FiOpeningBalance.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.FiOpeningBalance.qry,
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
    setWindowOpen(true)
  }

  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
  }

  const del = async obj => {
    await postRequest({
      extension: FinancialRepository.FiOpeningBalance.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  return (
    <>
      <Box>
        <GridToolbar onAdd={add} maxAccess={access} />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <FiOpeningBalancesWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
        />
      )}
    </>
  )
}

export default FiOpeningBalance
