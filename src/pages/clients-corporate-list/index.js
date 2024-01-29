
import React, { useContext, useEffect } from 'react'
import { Box, Grid } from '@mui/material'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { CommonContext } from 'src/providers/CommonContext'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { formatDateToApi, formatDateToApiFunction, formatDateDefault } from 'src/lib/date-helper'


// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import ClientWindow from './Windows/ClientWindow'
import TransactionLog from 'src/components/Shared/TransactionLog'
import OTPPhoneVerification from 'src/components/Shared/OTPPhoneVerification'
import { getNewClientCorporate, populateClientCorporate } from 'src/Models/RemittanceSettings/clientsCorporate'
import { useWindow } from 'src/windows'
import ClientTemplateForm from './forms/ClientTemplateForm'
import useResourceParams from 'src/hooks/useResourceParams'

const ClientsCorporateList = () => {
  const { stack } = useWindow()

  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  //control
  const [labels, setLabels] = useState(null)
  const [addressLabels, setAddressLabels] = useState(null)

  const [windowInfo, setWindowInfo] = useState(null)
  const [editMode, setEditMode] = useState(null)
  const [referenceRequired, setReferenceRequired] = useState(true)


  //stores
  const [gridData, setGridData] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)

  const {
    labels: _labels,
    access
  } = useResourceParams({
    datasetId: ResourceIds.ClientCorporate
  })


  // const _labels = {

  //   category: labels && labels.find((item) => item.key === "1").value,
  //   reference: labels && labels.find((item) => item.key === "2").value,
  //   name : labels && labels.find((item) => item.key === "3").value,
  //   cellPhone: labels && labels.find((item) => item.key === "4").value,
  //   plant: labels && labels.find(item => item.key === "5").value,
  //   nationality: labels && labels.find((item) => item.key === "6").value,
  //   keyword: labels && labels.find((item) => item.key === "7").value,
  //   status: labels && labels.find((item) => item.key === "8").value,
  //   createdDate: labels && labels.find((item) => item.key === "9").value,
  //   expiryDate: labels && labels.find(item => item.key === "10").value,
  //   oldReference: labels && labels.find((item) => item.key === "11").value,
  //   keyword: labels && labels.find((item) => item.key === "12").value,
  //   legalStatus: labels && labels.find((item) => item.key === "13").value,
  //   industry: labels && labels.find((item) => item.key === "14").value,
  //   activity: labels && labels.find((item) => item.key === "15").value,
  //   capital: labels && labels.find((item) => item.key === "16").value,
  //   trading: labels && labels.find((item) => item.key === "17").value,
  //   outward: labels && labels.find((item) => item.key === "18").value,
  //   inward: labels && labels.find((item) => item.key === "19").value,
  //   flName: labels && labels.find((item) => item.key === "20").value,
  //   address: labels && labels.find((item) => item.key === "21").value,
  //   title: labels && labels.find((item) => item.key === "22").value,
  //   OTPVerified: labels && labels.find((item) => item.key === "23").value,
  //   name:
  //   addressLabels  && addressLabels.find(item => item.key === "1").value,
  // street1:
  //   addressLabels  && addressLabels.find(item => item.key === "2").value,
  // street2:
  //   addressLabels  && addressLabels.find(item => item.key === "3").value,
  // email:
  //   addressLabels  && addressLabels.find(item => item.key === "4").value,
  // email2:
  //   addressLabels  && addressLabels.find(item => item.key === "5").value,

  // country:
  //   addressLabels && addressLabels.find(item => item.key === "6").value,
  // state:
  //   addressLabels && addressLabels.find(item => item.key === "7").value,
  // city:
  //   addressLabels && addressLabels.find(item => item.key === "8").value,

  // postalCode:
  //   addressLabels && addressLabels.find(item => item.key === "9").value,
  // phone:
  //   addressLabels && addressLabels.find(item => item.key === "10").value,
  // phone2:
  //   addressLabels && addressLabels.find(item => item.key === "11").value,
  // phone3:
  //   addressLabels  && addressLabels.find(item => item.key === "12").value,
  // address:
  //   addressLabels && addressLabels.find(item => item.key === "13").value,

  // cityDistrict:
  //   addressLabels && addressLabels.find(item => item.key === "14").value,
  // bldgNo:
  //   addressLabels  && addressLabels.find(item => item.key === "15").value,
  // unitNo:
  //   addressLabels && addressLabels.find(item => item.key === "16").value,
  // subNo:
  //   addressLabels && addressLabels.find(item => item.key === "17").value
  // }



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

    // {
    //   field: 'lgsName',
    //   headerName: _labels.legalStatus,
    //   flex: 1,
    //   editable: false
    // },

    // {
    //   field: 'activityName',
    //   headerName: _labels.activity,
    //   flex: 1,
    //   editable: false
    // },

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
      valueGetter: ({ row }) =>formatDateDefault(row?.expiryDate)


    },


  ]

// const getPlantId = ()=>{

//   const userData = window.sessionStorage.getItem('userData') ? JSON.parse( window.sessionStorage.getItem('userData')) : null
//   var parameters = `_userId=${userData && userData.userId}&_key=plantId`
//   getRequest({
//     extension: SystemRepository.SystemPlant.get,
//     parameters: parameters
//   })
//     .then(res => {


//       clientCorporateFormValidation.setFieldValue('plantId', res.record.value)


//     })
//     .catch(error => {
//       setErrorMessage(error)
//     })

// }



  const clientCorporateFormValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validateOnBlur: true,

    validationSchema: yup.object({
       reference: referenceRequired && yup.string().required("This field is required"),


      expiryDate: yup.string().required("This field is required"),
      countryId: yup.string().required("This field is required"),
      cityId: yup.string().required("This field is required"),
      name1: yup.string().required("This field is required"),

      name: yup.string().required("This field is required"),
      nationalityId: yup.string().required("This field is required"),
      cellPhone: yup.string().required("This field is required"),
      capital: yup.string().required("This field is required"),
      lgsId: yup.string().required("This field is required"),
      industry: yup.string().required("This field is required"),
      activityId: yup.string().required("This field is required"),

      street1:  yup.string().required('This field is required'),
      phone: yup.string().required('This field is required')
    }),
    onSubmit: (values) => {
      console.log("values" + values);
       postRtDefault(values);
    },
  });

      // console.log("values" + values);

  const postRtDefault = (obj) => {

     const date = new Date()

    //ClientCorporate

    const obj1 = {
      clientId: 0,
      lgsId: obj.lgsId,
      industry: obj.industry,
      activityId:obj.activityId,
      capital:obj.capital,
      trading:obj.trading,
      outward:obj.outward,
      inward:obj.inward,

    };


    //ClientMaster
    const obj2 = {
      category: 2,
      reference : obj.reference,
      name: obj.name1,
      flName: obj.flName,
      nationalityId : obj.nationalityId,
      status: 1,
      plantId: clientCorporateFormValidation.values.plantId ,
      cellPhone : obj.cellPhone,
      oldReference : obj.oldReference,
      otp : obj.otpVerified,
      ExpiryDate: formatDateToApiFunction(obj.expiryDate),
      createdDate:  formatDateToApi(date.toISOString()),
    };

// Address
     const obj3 = {
      name: obj.name,
      countryId: obj.countryId,
      stateId: obj.stateId,
      cityId: obj.cityId,
      cityName: obj.cityName,
      street1: obj.street1,
      street2: obj.street2,
      email1: obj.email1,
      email2: obj.email2,
      phone: obj.phone,
      phone2: obj.phone2,
      phone3: obj.phone3,
      addressId: obj.addressId,
      postalCode:obj.postalCode,
      cityDistrictId: obj.cityDistrictId,
      bldgNo: obj.bldgNo,
      unitNo: obj.unitNo,
      subNo: obj.subNo
     }



    const data = {
      clientMaster: obj2,
      clientCorporate: obj1,
      address:obj3,


    };

    postRequest({
      extension: CTCLRepository.ClientCorporate.set2,
      record: JSON.stringify(data),
    })
      .then((res) => {
        if (res){
         toast.success("Record Successfully");
         clientCorporateFormValidation.setFieldValue('clientId' , res.recordId)

        setShowOtpVerification(true)
        setEditMode(true)
        getClient(res.recordId)
        }
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };


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
      height: 400,
      title: _labels.pageTitle
    })
  }






  const search = inp => {
    setGridData({count : 0, list: [] , message :"",  statusId:1})
     const input = inp
     console.log({list: []})

     if(input){
    var parameters = `_size=30&_startAt=0&_filter=${input}&_category=2`

    getRequest({
      extension: CTCLRepository.ClientCorporate.snapshot,
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

return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >



<GridToolbar onAdd={addClient} maxAccess={access}    onSearch={search} labels={_labels}  inputSearch={true}  />

{gridData &&
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['clientId']}
          isLoading={false}
          maxAccess={access}
          onEdit={editClient}
        />}


<ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage}  />

      </Box>


    </>
  )
}

export default ClientsCorporateList
