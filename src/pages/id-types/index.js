// ** React Importsport
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
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import IdTypesWindow from './Windows/IdTypesWindow'

// ** Helpers
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'

const IdTypes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  //control

  const {
    query: { data },
    labels : _labels,
    paginationParameters,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
     queryFn: fetchGridData,
     endpointId: CurrencyTradingSettingsRepository.IdTypes.qry,
     datasetId: ResourceIds.IdTypes,
   })

  async function fetchGridData(options={}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams

     const response =  await getRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.page,
      parameters: parameters
    })

    return {...response,  _startAt: _startAt}
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'format',
      headerName: _labels.format,
      flex: 1
    },
    {
      field: 'length',
      headerName: _labels.length,
      flex: 1
    }
  ]

  const delCharacteristics = obj => {
    postRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        invalidate()
      })
  }

  const addCharacteristics = () => {
    openForm('')
  }

  function openForm (recordId){
    stack({
      Component: IdTypesWindow,
      props: {
        labels: _labels,
        recordId: recordId? recordId : null,
        maxAccess: access,
      },
      width: 600,
      height: 600,
      title: _labels.idTypes
    })
  }

  const popup = obj => {
    openForm(obj?.recordId )
  }

  return (
    <>
      <Box>
        <GridToolbar onAdd={addCharacteristics} maxAccess={access} />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={popup}
          onDelete={delCharacteristics}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
    </>
  )
}

export default IdTypes
