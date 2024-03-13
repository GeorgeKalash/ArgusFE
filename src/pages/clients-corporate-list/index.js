
import React, { useContext, useEffect } from 'react'
import { Box, Grid } from '@mui/material'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { SystemRepository } from 'src/repositories/SystemRepository'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { formatDateDefault } from 'src/lib/date-helper'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useWindow } from 'src/windows'
import ClientTemplateForm from './forms/ClientTemplateForm'
import { useResourceQuery } from 'src/hooks/resource'

const ClientsCorporateList = () => {
  const { stack } = useWindow()
  const { getRequest } = useContext(RequestsContext)

  //control
  const [editMode, setEditMode] = useState(null)

  //stores
  const [errorMessage, setErrorMessage] = useState(null)

  const {
    query: { data },
    filterBy,
    clearFilter,
    labels: _labels,
    access
  } = useResourceQuery({
    endpointId: CTCLRepository.ClientCorporate.snapshot,
    datasetId: ResourceIds.ClientCorporate,
    filter: {
      endpointId: CTCLRepository.ClientCorporate.snapshot,
      filterFn: fetchWithSearch,
      default : {category : 2}
    }
  })

  async function fetchWithSearch({options = {}, filters}) {
    return await getRequest({
          extension: CTCLRepository.ClientCorporate.snapshot,
          parameters: `_filter=${filters.qry}&_category=2`
        })
  }


  const columns = [

    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1,
      editable: false
    },

    {
      field: 'name',
      headerName: _labels?.name,
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
      field: 'nationalityName',

      headerName: _labels.nationality,
      flex: 1,
      editable: false
    },

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
      valueGetter: ({ row }) =>formatDateDefault(row?.expiryDate)


    },


  ]



  const addClient = async (obj) => {

    try {
      const plantId = await getPlantId();

      if (plantId !== '') {
        setEditMode(false);

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
        extension: SystemRepository.UserDefaults.get,
        parameters: parameters,
      });

      if (res.record.value) {
        return res.record.value;
      }

      return '';
    } catch (error) {
      // Handle errors if needed
      setErrorMessage(error);

       return '';
    }
  };

  const editClient= obj => {
    setEditMode(true)
    const _recordId = obj.recordId
    openForm(_recordId)

  }
  function openForm (recordId){
    stack({
      Component: ClientTemplateForm,
      props: {
        setErrorMessage: setErrorMessage,
        _labels : _labels,
        maxAccess: access,
        editMode: editMode,
        recordId: recordId ? recordId : null ,
        maxAccess: access
      },
      width: 1100,
      height: 500,
      title: _labels.clientCorporate
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


<GridToolbar onAdd={addClient} maxAccess={access}  onSearch={value => {
              filterBy('qry', value)
            }}
            onSearchClear={() => {
              clearFilter('qry')
            }}

            labels={_labels}  inputSearch={true}  />


        <Table
          columns={columns}
          gridData={data ? data : {list: []}}
          rowId={['clientId']}
          isLoading={false}
          maxAccess={access}
          onEdit={editClient}
        />
<ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage}  />

      </Box>


    </>
  )
}

export default ClientsCorporateList
