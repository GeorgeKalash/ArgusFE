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

// ** Helpers
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import ProductMasterWindow from './Windows/ProductMasterWindow'

const ProductMaster = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels : _labels,
    paginationParameters,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
     queryFn: fetchGridData,
     endpointId: RemittanceSettingsRepository.Correspondent.qry,
     datasetId: ResourceIds.ProductMaster,

   })

  async function fetchGridData(options={}) {
    const { _startAt = 0, _pageSize = 50 } = options
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams

     const response =  await getRequest({
      extension: RemittanceSettingsRepository.ProductMaster.page,
      parameters: parameters
    })

    return {...response,  _startAt: _startAt}
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
    {
      field: 'typeName',
      headerName: _labels.type,
      flex: 1
    },
    {
      field: 'functionName',
      headerName: _labels.function,
      flex: 1
    },
    {
      field: 'commissionBaseName',
      headerName: _labels.commissionBase,
      flex: 1
    }
  ]


  const del = obj => {
    postRequest({
      extension: RemittanceSettingsRepository.ProductMaster.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        invalidate()
      })
      .catch(error => {
      })
  }

  const add = () => {
    openForm('')
  }

  function openForm (recordId){
    stack({
      Component: ProductMasterWindow,
      props: {
        labels: _labels,
        recordId: recordId? recordId : null,
        maxAccess: access,
      },
      width: 1000,
      height: 500,
      title: _labels?.productMaster
    })
  }

  const edit = obj => {
   openForm(obj?.recordId)
  }

  return (
    <>
      <Box>
        <GridToolbar onAdd={add} maxAccess={access} />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
    </>
  )
}

export default ProductMaster
