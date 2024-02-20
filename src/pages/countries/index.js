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
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Helpers
import {getFormattedNumberMax, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import CountryWindow from './Windows/CountryWindow'

const Countries = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: SystemRepository.Country.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.Country.page,
    datasetId: ResourceIds.Countries
  }) //client side paging

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Country.page
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
    },
    {
      field: 'flName',
      headerName: _labels.fLang,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'regionName',
      headerName: _labels.geoRegion,
      flex: 1
    },
    {
      field: 'ibanLength',
      headerName: _labels.ibanLength,
      flex: 1,
      align: 'right',

      valueGetter: ({ row }) => getFormattedNumberMax(row?.ibanLength, 5, 0)
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: SystemRepository.Country.del,
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
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
       <CountryWindow
       onClose={() => {
        setWindowOpen(false)
        setSelectedRecordId(null)
      }}
       _labels ={_labels}
       maxAccess={access}
       recordId={selectedRecordId}
       setSelectedRecordId={setSelectedRecordId}
       onInfo={() => setWindowInfo(true)}
       />
       )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Countries
