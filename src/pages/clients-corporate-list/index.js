
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
import { formatDateToApi, formatDateToApiFunction } from 'src/lib/date-helper'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { DataSets } from 'src/resources/DataSets'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { formatDateFromApi } from 'src/lib/date-helper'
import ClientWindow from './Windows/ClientWindow'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import TransactionLog from 'src/components/Shared/TransactionLog'
import OTPPhoneVerification from 'src/components/Shared/OTPPhoneVerification'
import { getNewClientCorporate, populateClientCorporate } from 'src/Models/RemittanceSettings/clientsCorporate'

const ClientsCorporateList = () => {


  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  //control
  const [labels, setLabels] = useState(null)
  const [addressLabels, setAddressLabels] = useState(null)

  const [access, setAccess] = useState(null)
  const [windowOpen, setWindowOpen] = useState(null)
  const [windowInfo, setWindowInfo] = useState(null)
  const [editMode, setEditMode] = useState(null)
  const [referenceRequired, setReferenceRequired] = useState(true)


  //stores
  const [gridData, setGridData] = useState([])

  //states

  const [countryStore, setCountryStore] = useState([]);
  const [cityAddressStore, setCityAddressStore] = useState([]);
  const [legalStatusStore, setLegalStatusStore] = useState([]);
  const [activityStore, setActivityStore] = useState([]);
  const [industryStore, setIndustryStore] = useState([]);


  const [stateAddressStore, setStateAddressStore] = useState([]);

const [cityDistrictAddressStore , setCityDistrictAddressStore] = useState([])

  const [errorMessage, setErrorMessage] = useState(null)
 const [showOtpVerification , setShowOtpVerification] = useState(false)
  useEffect(() => {
    if (!access) getAccess(ResourceIds.ClientCorporate, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getLabels(ResourceIds.ClientCorporate, setLabels)
        getLabels(ResourceIds.Address, setAddressLabels)


        fillCountryStore();
        fillLegalStatusStore()
        fillActivityStore()
        fillIndustryStore()
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const _labels = {

    category: labels && labels.find((item) => item.key === "1").value,
    reference: labels && labels.find((item) => item.key === "2").value,
    name : labels && labels.find((item) => item.key === "3").value,
    cellPhone: labels && labels.find((item) => item.key === "4").value,
    plant: labels && labels.find(item => item.key === "5").value,
    nationality: labels && labels.find((item) => item.key === "6").value,
    keyword: labels && labels.find((item) => item.key === "7").value,
    status: labels && labels.find((item) => item.key === "8").value,
    createdDate: labels && labels.find((item) => item.key === "9").value,
    expiryDate: labels && labels.find(item => item.key === "10").value,
    oldReference: labels && labels.find((item) => item.key === "11").value,
    keyword: labels && labels.find((item) => item.key === "12").value,
    legalStatus: labels && labels.find((item) => item.key === "13").value,
    industry: labels && labels.find((item) => item.key === "14").value,
    activity: labels && labels.find((item) => item.key === "15").value,
    capital: labels && labels.find((item) => item.key === "16").value,
    trading: labels && labels.find((item) => item.key === "17").value,
    outward: labels && labels.find((item) => item.key === "18").value,
    inward: labels && labels.find((item) => item.key === "19").value,
    flName: labels && labels.find((item) => item.key === "20").value,
    address: labels && labels.find((item) => item.key === "21").value,
    title: labels && labels.find((item) => item.key === "22").value,
    OTPVerified: labels && labels.find((item) => item.key === "23").value,
    name:
    addressLabels  && addressLabels.find(item => item.key === "1").value,
  street1:
    addressLabels  && addressLabels.find(item => item.key === "2").value,
  street2:
    addressLabels  && addressLabels.find(item => item.key === "3").value,
  email:
    addressLabels  && addressLabels.find(item => item.key === "4").value,
  email2:
    addressLabels  && addressLabels.find(item => item.key === "5").value,

  country:
    addressLabels && addressLabels.find(item => item.key === "6").value,
  state:
    addressLabels && addressLabels.find(item => item.key === "7").value,
  city:
    addressLabels && addressLabels.find(item => item.key === "8").value,

  postalCode:
    addressLabels && addressLabels.find(item => item.key === "9").value,
  phone:
    addressLabels && addressLabels.find(item => item.key === "10").value,
  phone2:
    addressLabels && addressLabels.find(item => item.key === "11").value,
  phone3:
    addressLabels  && addressLabels.find(item => item.key === "12").value,
  address:
    addressLabels && addressLabels.find(item => item.key === "13").value,

  cityDistrict:
    addressLabels && addressLabels.find(item => item.key === "14").value,
  bldgNo:
    addressLabels  && addressLabels.find(item => item.key === "15").value,
  unitNo:
    addressLabels && addressLabels.find(item => item.key === "16").value,
  subNo:
    addressLabels && addressLabels.find(item => item.key === "17").value
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
      valueGetter: ({ row }) => formatDateFromApi(row?.createdDate)

    },

    {
      field: 'expiryDate',

      headerName: _labels.expiryDate,
      flex: 1,
      editable: false,
      valueGetter: ({ row }) => formatDateFromApi(row?.expiryDate)


    },

    // {
    //   field: 'otp',

    //   headerName: _labels.otp,
    //   flex: 1,
    //   editable: false,

    // }
  ]

const getPlantId = ()=>{

  const userData = window.sessionStorage.getItem('userData') ? JSON.parse( window.sessionStorage.getItem('userData')) : null
  var parameters = `_userId=${userData && userData.userId}&_key=plantId`
  getRequest({
    extension: SystemRepository.SystemPlant.get,
    parameters: parameters
  })
    .then(res => {


      clientCorporateFormValidation.setFieldValue('plantId', res.record.value)


    })
    .catch(error => {
      setErrorMessage(error)
    })

}



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

      // cellPhoneRepeat : yup.string().required('Repeat Password is required')
      // .oneOf([yup.ref('cellPhone'), null], 'Cell phone must match'),
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






  const addClient= obj => {
     setEditMode(false)
    clientCorporateFormValidation.setValues(getNewClientCorporate())
    getPlantId()
    setWindowOpen(true)
  }

  const editClient= obj => {
    setEditMode(true)
    const recordId = obj.recordId

    getClient(recordId)


  }


  const getClient =(recordId)=>{
    const defaultParams = `_clientId=${recordId}`
    var parameters = defaultParams
    getRequest({
      extension: CTCLRepository.ClientCorporate.get,
      parameters: parameters
    })
      .then(res => {
        clientCorporateFormValidation.setValues(populateClientCorporate(res.record))


        getPlantId()
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleSubmit = () => {

    clientCorporateFormValidation.handleSubmit();

  };

  const fillStateStoreAddress = countryId => {
    setStateAddressStore([])
    var parameters = `_countryId=${countryId}`
    getRequest({
      extension: SystemRepository.State.qry,
      parameters: parameters
    })
      .then(res => {
        setStateAddressStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }



  const fillCountryStore = () => {
    var parameters = `_filter=`;
    getRequest({
      extension: SystemRepository.Country.qry,
      parameters: parameters,
    })
      .then((res) => {
        setCountryStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };

;

  const fillLegalStatusStore = () => {
    var parameters = `_pagesize=30&_startAt=0&_filter=`;
    getRequest({
      extension: BusinessPartnerRepository.LegalStatus.qry,
      parameters: parameters,
    })
      .then((res) => {
        setLegalStatusStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };

  const fillActivityStore = () => {
    var parameters = `_pagesize=30&_startAt=0&_filter=`;
    getRequest({
      extension: CurrencyTradingSettingsRepository.Activity.qry,
      parameters: parameters,
    })
      .then((res) => {
        setActivityStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };


  const lookupCityAddress = (searchQry) => {
    setCityAddressStore([]);
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}&_countryId=${clientCorporateFormValidation.values.countryId}&_stateId=${clientCorporateFormValidation.values.stateId || 0}`;
    getRequest({
      extension: SystemRepository.City.snapshot,
      parameters: parameters,
    })
      .then((res) => {
        // console.log(res.list);
        setCityAddressStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };



  const lookupCityDistrictAddress = searchQry => {
    setCityDistrictAddressStore([])
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}&_cityId=${clientCorporateFormValidation.values.cityId}`

    getRequest({
      extension: SystemRepository.CityDistrict.snapshot,
      parameters: parameters
    })
      .then(res => {

        setCityDistrictAddressStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillIndustryStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.INDUSTRY,
      callback: setIndustryStore
    })
  };

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
     {windowOpen && (
       <ClientWindow
       onClose={() => setWindowOpen(false)}
       width={1100}
       height={600}
       onSave={handleSubmit}
       onInfo={()=>{setWindowInfo(true)}}
       onInfoClose={()=>{setWindowInfo(false)}}
       clientCorporateFormValidation={clientCorporateFormValidation}
       legalStatusStore={legalStatusStore}
       activityStore={activityStore}
      countryStore={countryStore}
      cityAddressStore={cityAddressStore}
      setCityAddressStore={setCityAddressStore}
      lookupCityAddress={lookupCityAddress}
      lookupCityDistrictAddress={lookupCityDistrictAddress}
      fillStateStoreAddress={fillStateStoreAddress}
      cityDistrictAddressStore={cityDistrictAddressStore}
      stateAddressStore={stateAddressStore}
      setReferenceRequired={setReferenceRequired}

      industryStore ={industryStore}
      _labels ={_labels}
      maxAccess={access}
      editMode={editMode}


       />
       )}
       {showOtpVerification && <OTPPhoneVerification  formValidation={clientCorporateFormValidation} functionId={3600}  onClose={() => setShowOtpVerification(false)} setShowOtpVerification={setShowOtpVerification} setEditMode={setEditMode}  setErrorMessage={setErrorMessage}/>}
       {windowInfo && <TransactionLog activityStore={activityStore} resourceId={ResourceIds && ResourceIds.ClientList}  recordId={clientCorporateFormValidation.values.recordId}  onInfoClose={() => setWindowInfo(false)}
/>}

<ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage}  />

      </Box>


    </>
  )
}

export default ClientsCorporateList
