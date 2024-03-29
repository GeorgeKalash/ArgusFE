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
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'

// ** Windows
import LoCarriersWindow from './Windows/LoCarriersWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'

const LoCarrier = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [businessPartnerStore, setBusinessPartnerStore] = useState([])
  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: LogisticsRepository.LoCarrier.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: LogisticsRepository.LoCarrier.page,
    datasetId: ResourceIds.LoCarriers
  })

  const invalidate = useInvalidate({
    endpointId: LogisticsRepository.LoCarrier.page
  })

  const lookupBusinessPartners = searchQry => {
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}`
    getRequest({
      extension: BusinessPartnerRepository.MasterData.snapshot,
      parameters: parameters
    })
      .then(res => {
        setBusinessPartnerStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

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
      extension: LogisticsRepository.LoCarrier.del,
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
        <LoCarriersWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
          lookupBusinessPartners={lookupBusinessPartners}
          businessPartnerStore={businessPartnerStore}
          setBusinessPartnerStore={setBusinessPartnerStore}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default LoCarrier
