// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { useWindow } from 'src/windows'
import ProductDispersalForm from './productDispersalForm'

const ProductDispersalList = ({ store, setStore, labels, maxAccess, expanded,height }) => {
  const {recordId : pId} = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [gridData , setGridData] = useState()
  const { stack } = useWindow()

  const getGridData = pId => {
    setGridData([]);
    const defaultParams = `_productId=${pId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductDispersal.qry,
      parameters: parameters
    })
      .then(res => {
          setGridData(res);

          setStore(prevStore => ({
            ...prevStore,
              dispersals: res.list

          }));
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'dispersalTypeName',
      headerName: labels.dispersalType,
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: labels.isInactive,
      flex: 1
    },
    {
      field: 'isDefault',
      headerName:labels.isDefault,
      flex: 1
    }
  ]

  useEffect(()=>{
    pId && getGridData(pId)
  },[pId])

  const add = () => {
    openForm('')
  }

  const edit = (object) => {
    openForm(object.recordId)
  }

  const del = obj => {
    postRequest({
      extension: RemittanceSettingsRepository.ProductDispersal.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getGridData(obj.productId)
      })
      .catch(error => {
      })
  }


  function openForm(recordId){
    stack({
      Component: ProductDispersalForm,
      props: {
        labels,
        recordId: recordId? recordId : null,
        pId,
        maxAccess,
        getGridData,
      },
      width: 500,
      height: 400,
      title: labels?.dispersal
    })
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
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={`${expanded ? `calc(100vh - 280px)` : `${height-100}`}`}
          />
      </Box>
    </>
  )
}

export default ProductDispersalList
