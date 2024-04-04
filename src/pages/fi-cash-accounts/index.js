// ** React Imports
import { useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { CashBankRepository } from 'src/repositories/CashBankRepository'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import CashAccountWindow from './Windows/CashAccountWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

const CashAccounts = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: CashBankRepository.CashAccount.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_type=2`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: CashBankRepository.CashAccount.snapshot,
      parameters: `_filter=${qry}&_type=2`
    })
  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    search,
    clear,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CashBankRepository.CashAccount.qry,
    datasetId: ResourceIds.CashAccounts,
    search: {
        endpointId: CashBankRepository.CashAccount.snapshot,
        searchFn: fetchWithSearch
      }
  })

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CashAccount.qry
  })

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'plantName',
      headerName: _labels.plant,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.status,
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
      field: 'groupName',
      headerName: _labels.groupId,
      flex: 1
    }
  ]

  const del = async obj => {
    postRequest({
      extension: CashBankRepository.CashAccount.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const add = () => {
    setWindowOpen(true)
  }

  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
  }

  return (
    <>
      <Box>
        <GridToolbar 
            onAdd={add} 
            maxAccess={access}
            onSearch={search}
            labels={_labels}
            onSearchClear={clear}
            inputSearch={true}
        />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Box>
      {windowOpen && (
        <CashAccountWindow
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
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default CashAccounts
