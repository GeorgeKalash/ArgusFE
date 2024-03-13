// ** React Imports
import { useState, useContext } from 'react'

// ** MUI Imports
import {Box } from '@mui/material'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'

// ** Windows
import ExchangeTablesWindow from './Windows/ExchangeTablesWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const ExchangeTables = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
 
  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: MultiCurrencyRepository.ExchangeTable.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return {...response,  _startAt: _startAt}

  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: MultiCurrencyRepository.ExchangeTable.page,
    datasetId: ResourceIds.ExchangeTables
  })

  const invalidate = useInvalidate({
    endpointId: MultiCurrencyRepository.ExchangeTable.page
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1,
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1,
    },
    {
      field: 'currencyRef',
      headerName: _labels.currency,
      flex: 1,
    },
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
      extension: MultiCurrencyRepository.ExchangeTable.del,
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
          refetch={refetch}
          pageSize={50}
          paginationParameters={paginationParameters}
          maxAccess={access}
          paginationType='api'
        />
      </Box>
      {windowOpen && (
        <ExchangeTablesWindow
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

export default ExchangeTables
