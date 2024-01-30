
import React, { useContext } from 'react'
import { Box } from '@mui/material'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'

import { SystemRepository } from 'src/repositories/SystemRepository'
import GridToolbar from 'src/components/Shared/GridToolbar'
import {  formatDateDefault} from 'src/lib/date-helper'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useWindow } from 'src/windows'
import ClientTemplateForm from './forms/ClientTemplateForm'
import useResourceParams from 'src/hooks/useResourceParams'

const ClientsList = () => {

  const { stack } = useWindow()

  //control
  const { getRequest } = useContext(RequestsContext)

  //stores
  const [gridData, setGridData] = useState([])

  //error
  const [errorMessage, setErrorMessage] = useState(null)


  const {
    labels: _labels,
    access
  } = useResourceParams({
    datasetId: ResourceIds.ClientMaster
  })

  const columns = [
    {
      field: 'categoryName',
      headerName: _labels?.category,
      flex: 1,
      editable: false
    },
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1,
      editable: false
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1,
      editable: false
    },

    {
      field: 'flName',
      headerName: _labels.flName,
      flex: 1,
      editable: false
    },
    {
      field: 'cellPhone',
      headerName: _labels.cellPhone,
      flex: 1,
      editable: false
    },
    {
      field: 'plantName',
      headerName: _labels.plant,
      flex: 1,
      editable: false
    },
    {
      field: 'nationalityName',
      headerName: _labels.nationality,
      flex: 1,
      editable: false
    },

    // {
    //   field: 'keyword',
    //   headerName: _labels.keyword,
    //   flex: 1,
    //   editable: false
    // },

    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1,
      editable: false,
    },

    {
      field: 'createdDate',
      headerName: _labels.createdDate,
      flex: 1,
      editable: false,
      valueGetter: ({ row }) => formatDateDefault(row?.createdDate)

    },
    {
      field: 'expiryDate',
      headerName: _labels.expiryDate,
      flex: 1,
      editable: false,
      valueGetter: ({ row }) => formatDateDefault(row?.expiryDate)

    },
    {
      field: 'otp',
      headerName: _labels.otp,
      flex: 1,
      editable: false,

    }
  ]

  const search = inp => {
    setGridData({count : 0, list: [] , message :"",  statusId:1})
     const input = inp

     if(input){
      var parameters = `_size=30&_startAt=0&_filter=${input}&_category=1`

    getRequest({
      extension: CTCLRepository.CtClientIndividual.snapshot,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })

    }else{

      setGridData({count : 0, list: [] , message :"",  statusId:1})
    }

  }


  function openForm (recordId){
    stack({
      Component: ClientTemplateForm,
      props: {
        setErrorMessage: setErrorMessage,
        _labels : _labels,
        maxAccess: access,
        recordId: recordId ? recordId : null ,
        maxAccess: access
      },
      width: 1100,
      height: 400,
      title: _labels.pageTitle
    })
  }

  const addClient = async () => {
    try {
      const plantId = await getPlantId();
      if (plantId !== '') {
        openForm('')
      } else {
        setErrorMessage({ error: 'The user does not have a default plant' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getPlantId = async () => {
    const userData = window.sessionStorage.getItem('userData')
      ? JSON.parse(window.sessionStorage.getItem('userData'))
      : null;
    const parameters = `_userId=${userData && userData.userId}&_key=plantId`;

    try {
      const res = await getRequest({
        extension: SystemRepository.SystemPlant.get,
        parameters: parameters,
      });

      if (res.record.value) {
        return res.record.value;
      }

      return '';
    } catch (error) {
      setErrorMessage(error);

       return '';
    }
  };

  const editClient= obj => {
    const _recordId = obj.recordId
    openForm(_recordId)
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

<GridToolbar onAdd={addClient} maxAccess={access}    onSearch={search} labels={_labels}  inputSearch={true}/>

{gridData &&
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          isLoading={false}
          maxAccess={access}
          onEdit={editClient}
          pageSize={50}
          paginationType='client'
        />}

<ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage}  />

      </Box>


    </>
  )
}

export default ClientsList
