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
import MultiCurrencyWindow from './Windows/MultiCurrencyWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'


const MultiCurrencyMapping = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
 
  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const [selectedCurrencyId, setSelectedCurrencyId] = useState(null)
  const [selectedRateTypeId, setSelectedRateTypeId] = useState(null)
  

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: MultiCurrencyRepository.McExchangeMap.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: MultiCurrencyRepository.McExchangeMap.page,
    datasetId: ResourceIds.MultiCurrencyMapping
  })

  const invalidate = useInvalidate({
    endpointId: MultiCurrencyRepository.McExchangeMap.page
  })

  const columns = [
    {
      field: 'currencyName',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'rateTypeName',
      headerName: _labels.rateType,
      flex: 1
    },
    {
      field: 'exName',
      headerName: _labels.exchange,
      flex: 1
    }
  ]


  const add = () => {
    setWindowOpen(true)
    setSelectedCurrencyId(null)
    setSelectedRateTypeId(null)
  }

  const edit = obj => {
    // setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
    
    setSelectedCurrencyId(obj.currencyId)
    setSelectedRateTypeId(obj.rateTypeId)
   

  }

  const del = async obj => {
    await postRequest({
      extension: MultiCurrencyRepository.McExchangeMap.del,
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
          rowId={['currencyId','rateTypeId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <MultiCurrencyWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
          
          currencyId={selectedCurrencyId}
          rateTypeId={selectedRateTypeId}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}




export default MultiCurrencyMapping


