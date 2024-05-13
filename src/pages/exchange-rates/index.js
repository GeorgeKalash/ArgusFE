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
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

import { useWindow } from 'src/windows'

import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import ExRatesForm from './ExRatesForm'

const ExchangeRates = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: MultiCurrencyRepository.ExchangeRates.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access,

    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: MultiCurrencyRepository.ExchangeRates.qry,
    datasetId: ResourceIds.ExchangeRates
  })

  const invalidate = useInvalidate({
    endpointId: MultiCurrencyRepository.ExchangeRates.qry
  })

  const formatDate = dateStr => {
    return `${dateStr.substring(0, 4)}/${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`
  }

  const columns = [
    {
      field: 'exName',
      headerName: _labels.exTable,
      flex: 1
    },

    {
      field: 'dayId',
      headerName: _labels.stDate,
      flex: 1,
      valueFormatter: ({ value }) => formatDate(value)
    },
    ,
    {
      field: 'rate',
      headerName: _labels.rate,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: MultiCurrencyRepository.ExchangeRates.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: ExRatesForm,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 500,
      height: 400,
      title: _labels.exRate
    })
  }

  return (
    <>
      <Box>
        <GridToolbar onAdd={add} maxAccess={access} labels={_labels} />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          maxAccess={access}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Box>
    </>
  )
}

export default ExchangeRates
