
import React, { useContext, useEffect } from 'react'
import { Box } from '@mui/material'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'

import { SystemRepository } from 'src/repositories/SystemRepository'
import GridToolbar from 'src/components/Shared/GridToolbar'
import {  formatDateDefault} from 'src/lib/date-helper'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import ClientWindow from './Windows/ClientWindow'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import ClientTemplateForm from './forms/ClientTemplateForm'
import useResourceParams from 'src/hooks/useResourceParams'

const ClientsList = () => {

  const { stack } = useWindow()


  const { getRequest } = useContext(RequestsContext)

  //control

  // const [access, setAccess] = useState(null)
  const [windowOpen, setWindowOpen] = useState(null)
  const [editMode, setEditMode] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])

  //states
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)


  const {
    labels: _labels,
    access
  } = useResourceParams({
    datasetId: ResourceIds.ClientMaster
  })


  // const {
  //   labels:  _labels2,
  // } = useResourceParams({
  //   datasetId: ResourceIds.ClientMaster
  // })


  useEffect(() => {
    // if (!access) getAccess(ResourceIds.ClientList, setAccess)
    // else {
      // if (access.record.maxAccess > 0) {

        // getLabels(ResourceIds.ClientList, setLabels)
        // getLabels(ResourceIds.ClientMaster, setLabels2)


    //   } else {
    //     setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
    //   }
    // }
  }, [access])

  // const _labels = {
  //   category: labels && labels.find(item => item.key === "1").value,
  //   reference: labels && labels.find((item) => item.key === "2").value,
  //   name: labels && labels.find((item) => item.key === "3").value,
  //   flName : labels && labels.find((item) => item.key === "4").value,
  //   cellPhone: labels && labels.find((item) => item.key === "5").value,
  //   plant: labels && labels.find(item => item.key === "6").value,
  //   nationality: labels && labels.find((item) => item.key === "7").value,
  //   keyword: labels && labels.find((item) => item.key === "8").value,
  //   status: labels && labels.find((item) => item.key === "9").value,
  //   createdDate: labels && labels.find((item) => item.key === "10").value,
  //   expiryDate: labels && labels.find(item => item.key === "11").value,
  //   otp: labels && labels.find((item) => item.key === "12").value,

  // }




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

    {
      field: 'keyword',

      headerName: _labels.keyword,
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
    console.log('inp' + inp)
    setGridData({count : 0, list: [] , message :"",  statusId:1})
     const input = inp
     console.log({list: []})

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
        editMode: editMode,
        recordId: recordId ? recordId : null ,
        setSelectedRecordId: setSelectedRecordId,
        maxAccess: access
      },
      width: 1100,
      height: 400,
      title: _labels.pageTitle
    })
  }

  const addClient = async (obj) => {

    try {
      const plantId = await getPlantId();

      if (plantId !== '') {
        setEditMode(false);

        openForm('')

        // setWindowOpen(true);
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
      // Handle errors if needed
      setErrorMessage(error);

       return '';
    }
  };

  const editClient= obj => {
    setEditMode(true)
    const _recordId = obj.recordId
    setSelectedRecordId(_recordId)
    openForm(_recordId)

    // getClient(_recordId)

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
 {/* {windowOpen && (
       <ClientWindow
       onClose={() => {
        setWindowOpen(false)
        setSelectedRecordId(null)
      }}

       setErrorMessage={setErrorMessage}
      _labels ={_labels2}
      maxAccess={access}
      editMode={editMode}
      recordId={selectedRecordId}
      setSelectedRecordId={setSelectedRecordId}

       />

       )

       } */}

       {/* {windowConfirmNumberOpen &&  <ConfirmNumberWindow labels={_labels2} idTypeStore={idTypeStore} clientIndividualFormValidation={clientIndividualFormValidation}
        onClose={()=>setWindowConfirmNumberOpen(false)} width={400} height={300} />}
       {windowWorkAddressOpen && <AddressWorkWindow labels={_labels2} setShowWorkAddress={setWindowWorkAddressOpen} addressValidation={WorkAddressValidation}  onSave={()=>handleSubmit('address')}  onClose={()=>setWindowWorkAddressOpen(false)} requiredOptional={requiredOptional} readOnly={editMode && true} />}
       {showOtpVerification && <OTPPhoneVerification  formValidation={clientIndividualFormValidation} functionId={"3600"}  onClose={() => setShowOtpVerification(false)} setShowOtpVerification={setShowOtpVerification} setEditMode={setEditMode}  setErrorMessage={setErrorMessage}/>}
       {windowInfo && <TransactionLog  resourceId={ResourceIds && ResourceIds.ClientList}  recordId={clientIndividualFormValidation.values.clientId}  onInfoClose={() => setWindowInfo(false)}
/>} */}

<ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage}  />

      </Box>


    </>
  )
}

export default ClientsList
