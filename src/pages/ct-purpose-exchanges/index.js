// ** React Imports
import { useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import PurposeOfExchangeWindow from './windows/PurposeOfExchangeWindow'
import { useWindow } from 'src/windows'

const PurposeExchange = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: CurrencyTradingSettingsRepository.PurposeExchange.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CurrencyTradingSettingsRepository.PurposeExchange.page,
    datasetId: ResourceIds.PurposeOfExchange
  })

  const invalidate = useInvalidate({
    endpointId: CurrencyTradingSettingsRepository.PurposeExchange.page
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    }
  ]

  function openForm(recordId) {
    stack({
      Component: PurposeOfExchangeWindow,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access,
        setSelectedRecordId: setSelectedRecordId
      },
      width: 600,
      height: 600,
      title: _labels.idTypes
    })
  }

  const add = () => {
    openForm()
  }

  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: CurrencyTradingSettingsRepository.PurposeExchange.del,
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
          paginationType='client'
          maxAccess={access}
        />
      </Box>

      {windowOpen && (
        <PurposeOfExchangeWindow
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

export default PurposeExchange
