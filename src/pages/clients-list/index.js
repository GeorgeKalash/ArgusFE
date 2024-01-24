
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
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { CommonContext } from 'src/providers/CommonContext'
import { DataSets } from 'src/resources/DataSets'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { formatDateToApi, formatDateToApiFunction , formatDateDefault} from 'src/lib/date-helper'
import { getNewAddress, populateAddress } from 'src/Models/System/Address'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { formatDateFromApi } from 'src/lib/date-helper'
import ClientWindow from './Windows/ClientWindow'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { getNewClients, populateIClients } from 'src/Models/RemittanceSettings/clients'
import TransactionLog from 'src/components/Shared/TransactionLog'
import OTPPhoneVerification from 'src/components/Shared/OTPPhoneVerification'

import AddressWorkWindow from './Windows/AddressWorkWindow'
import ConfirmNumberWindow from './Windows/ConfirmNumberWindow'
import Confirmation from 'src/components/Shared/Confirmation'

const ClientsList = () => {


  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  //control
  const [labels, setLabels] = useState(null)
  const [labels2, setLabels2] = useState(null)

  const [access, setAccess] = useState(null)
  const [windowOpen, setWindowOpen] = useState(null)
  const [windowInfo, setWindowInfo] = useState(null)
  const [editMode, setEditMode] = useState(null)

 const [referenceRequired, setReferenceRequired] = useState(true)
 const [requiredOptional, setRequiredOptional] = useState(true)



  //stores
  const [gridData, setGridData] = useState([])

  //states

  const [types, setTypes] = useState([]);
  const [countryStore, setCountryStore] = useState([]);
  const [cityStore, setCityStore] = useState([]);

  const [professionStore, setProfessionStore] = useState([]);
  const [professionFilterStore, setProfessionFilterStore] = useState([]);

  const [salaryRangeStore, setSalaryRangeStore] = useState([]);
  const [incomeOfSourceStore, setIncomeOfSourceStore] = useState([]);
  const [smsLanguageStore, setSMSLanguageStore] = useState([]);
  const [civilStatusStore, setCivilStatusStore] = useState([]);
  const [genderStore, setGenderStore] = useState([]);
  const [stateAddressStore, setStateAddressStore] = useState([]);

  const [educationStore, setEducationStore] = useState([]);
  const [idTypeStore, setIdTypeStore] = useState([]);
  const [titleStore, setTitleStore] = useState([]);
const[mobileVerifiedStore , setMobileVerifiedStore]= useState([])
  const [errorMessage, setErrorMessage] = useState(null)
 const [showOtpVerification , setShowOtpVerification] = useState(false)
 const [windowWorkAddressOpen , setWindowWorkAddressOpen] = useState(false)
const [windowConfirmNumberOpen, setWindowConfirmNumberOpen] = useState(false)
  useEffect(() => {
    if (!access) getAccess(ResourceIds.ClientList, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        // getGridData({ _startAt: 0, _pageSize: 30 })

        getLabels(ResourceIds.ClientList, setLabels)
        getLabels(ResourceIds.ClientMaster, setLabels2)
        fillMobileVerifiedStore()
        fillType();
        fillCountryStore();
        fillProfessionStore();
        fillSalaryRangeStore();
        fillIncomeOfSourceStore();
        fillSMSLanguageStore();
        fillGenderStore();
        fillCivilStatusStore();
        fillEducationStore();
        fillIdTypeStore()
        fillTitleStore()
        fillMobileVerifiedStore()
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const _labels = {
    category: labels && labels.find(item => item.key === "1").value,
    reference: labels && labels.find((item) => item.key === "2").value,
    name: labels && labels.find((item) => item.key === "3").value,
    flName : labels && labels.find((item) => item.key === "4").value,
    cellPhone: labels && labels.find((item) => item.key === "5").value,
    plant: labels && labels.find(item => item.key === "6").value,
    nationality: labels && labels.find((item) => item.key === "7").value,
    keyword: labels && labels.find((item) => item.key === "8").value,
    status: labels && labels.find((item) => item.key === "9").value,
    createdDate: labels && labels.find((item) => item.key === "10").value,
    expiryDate: labels && labels.find(item => item.key === "11").value,
    otp: labels && labels.find((item) => item.key === "12").value,

  }


  const _labels2 = {
    reference: labels2 && labels2.find((item) => item.key === "1").value,
    birthDate: labels2 && labels2.find((item) => item.key === "2").value,
    isResident: labels2 && labels2.find((item) => item.key === "3").value,

    number: labels2 && labels2.find((item) => item.key === "5").value,

    // number: labels2 && labels2.find((item) => item.key === 5).value,
    type: labels2 && labels2.find((item) => item.key === "6").value,
    expiryDate: labels2 && labels2.find((item) => item.key === "7").value,
    issusDate: labels2 && labels2.find((item) => item.key === "8").value,
    country: labels2 && labels2.find((item) => item.key === "9").value,
    city: labels2 && labels2.find((item) => item.key === "10").value,
    first: labels2 && labels2.find((item) => item.key === "11").value,
    last: labels2 && labels2.find((item) => item.key === "12").value,
    middle: labels2 && labels2.find((item) => item.key === "13").value,
    family: labels2 && labels2.find((item) => item.key === "14").value,

    nationality: labels2 && labels2.find((item) => item.key === "15").value,
    profession: labels2 && labels2.find((item) => item.key === "16").value,
    cellPhone: labels2 && labels2.find((item) => item.key === "17").value,
    status: labels2 && labels2.find((item) => item.key === "18").value,
    oldReference: labels2 && labels2.find((item) => item.key === "19").value,
    whatsapp: labels2 && labels2.find((item) => item.key === "20").value,
    sponsor: labels2 && labels2.find((item) => item.key === "21").value,
    salaryRange: labels2 && labels2.find((item) => item.key === "22").value,
    riskLevel: labels2 && labels2.find((item) => item.key === "23").value,
    smsLanguage: labels2 && labels2.find((item) => item.key === "24").value,
    incomeSource: labels2 && labels2.find((item) => item.key === "25").value,
    civilStatus: labels2 && labels2.find((item) => item.key === "26").value,
    educationLevel: labels2 && labels2.find((item) => item.key === "27").value,
    gender: labels2 && labels2.find((item) => item.key === "28").value,
    title: labels2 && labels2.find((item) => item.key === "29").value,
    id: labels2 && labels2.find((item) => item.key === "30").value,
    name: labels2 && labels2.find((item) => item.key === "31").value,
    main: labels2 && labels2.find((item) => item.key === "32").value,

    bankAccounts: labels2 && labels2.find((item) => item.key === "33").value,
    isResident: labels2 && labels2.find((item) => item.key === "34").value,
    mobileVerified: labels2 && labels2.find((item) => item.key === "35").value,

    OTPVerified: labels2 && labels2.find((item) => item.key === "36").value,
    coveredFace: labels2 && labels2.find((item) => item.key === "37").value,
    isEmployed: labels2 && labels2.find((item) => item.key === "38").value,

    diplomat: labels2 && labels2.find((item) => item.key === "39").value,

    isDiplomat: labels2 && labels2.find((item) => item.key === "40").value,
    isDiplomatRelative:
      labels2 && labels2.find((item) => item.key === "41").value,

    relativeDiplomatInfo: labels2 && labels2.find((item) => item.key === "42").value,
    address: labels2 && labels2.find((item) => item.key === "43").value, // nationalityAddress
    customerInformation: labels2 && labels2.find((item) => item.key === '44').value,
    workAddress: labels2 && labels2.find((item) => item.key === '45').value,
    phone: labels2 && labels2.find((item) => item.key === '46').value,
    phone2: labels2 && labels2.find((item) => item.key === '47').value,
    email: labels2 && labels2.find((item) => item.key === '48').value,
    email2: labels2 && labels2.find((item) => item.key === '49').value,
     phone3: labels2 && labels2.find((item) => item.key === '50').value,
    bldgNo: labels2 && labels2.find((item) => item.key === '51').value,
    unitNo :  labels2 && labels2.find((item) => item.key === '52').value,
    subNo:  labels2 && labels2.find((item) => item.key === '53').value,
    postalCode :  labels2 && labels2.find((item) => item.key === '54').value,
    cityDistrict :  labels2 && labels2.find((item) => item.key === '55').value,

    street1 :  labels2 && labels2.find((item) => item.key === '56').value,
    street2 :  labels2 && labels2.find((item) => item.key === '57').value,
    category :  labels2 && labels2.find((item) => item.key === '58').value,
    foreignName :  labels2 && labels2.find((item) => item.key === '59').value,
    keyword :  labels2 && labels2.find((item) => item.key === '60').value,

    fl_first: labels2 && labels2.find((item) => item.key === '62').value,
    fl_last: labels2 && labels2.find((item) => item.key === '63').value,
    fl_middle: labels2 && labels2.find((item) => item.key === '64').value,
    fl_family: labels2 && labels2.find((item) => item.key === '65').value,

    state: labels2 && labels2.find((item) => item.key === '66').value,
     confirmNb: labels2 && labels2.find((item) => item.key === '67').value,
     confirmCell: labels2 && labels2.find((item) => item.key === '68').value,
     issusCountry: labels2 && labels2.find((item) => item.key === '69').value,
     issusPlace: labels2 && labels2.find((item) => item.key === '70').value,
     pageTitle: labels2 && labels2.find((item) => item.key === '71').value,
     fetch: labels2 && labels2.find((item) => item.key === '72').value,


  };


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



  const clientIndividualFormValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validateOnBlur: true,
    validate : (values) => {
      const errors = {};

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (values.isRelativeDiplomat  && !values.relativeDiplomatInfo ) {
        errors.relativeDiplomatInfo = 'Relative Diplomat Info is required';
      }

      if (values.email1  && !emailRegex.test(values.email1) ) {
        errors.email1 = 'Invalid email format';
      }

      if (values.email2 && !emailRegex.test(values.email2) ) {
        errors.email2 = 'Invalid email format';
      }

      return errors;

    },
    validationSchema: yup.object({
      reference: referenceRequired && yup.string().required("This field is required"),
      isResident: yup.string().required("This field is required"),
      birthDate: yup.string().required("This field is required"),
      idtId: yup.string().required("This field is required"),
      idNo:  yup.string().required("This field is required"),

      // idNoRepeat : yup.string().required('Repeat Password is required')
      // .oneOf([yup.ref('idNo'), null], 'Number must match'),

      expiryDate: !editMode && yup.string().required("This field is required"),
      countryId: yup.string().required("This field is required"),
      cityId: yup.string().required("This field is required"),
      idCountry: yup.string().required("This field is required"),

       name: yup.string().required("This field is required"),
      firstName: yup.string().required("This field is required"),
      lastName: yup.string().required("This field is required"),
      nationalityId: yup.string().required("This field is required"),
      professionId: yup.string().required("This field is required"),

      cellPhone: yup.string().required("This field is required"),
      cellPhoneRepeat : yup.string().required('Repeat Password is required')
      .oneOf([yup.ref('cellPhone'), null], 'Cell phone must match'),
      smsLanguage: yup.string().required("This field is required"),
      incomeSourceId: yup.string().required("This field is required"),
      gender: yup.string().required("This field is required"),
      street1:  yup.string().required('This field is required'),
      phone: yup.string().required('This field is required')
    }),
    onSubmit: (values) => {
           Object.keys(WorkAddressValidation.errors).length < 1 && postRtDefault(values);
    },
  });

      // console.log("values" + values);

  const postRtDefault = (obj) => {

     const date = new Date()

    //CTCL

    const obj1 = {
      category: 1,
      reference: obj.reference,
      name: obj.firstName,
      flName: obj.fl_firstName,
      nationalityId: obj.nationalityId,

      // status: obj.status,
      addressId: null,

      plantId: clientIndividualFormValidation.values.plantId ?clientIndividualFormValidation.values.plantId : 3,
      cellPhone: obj.cellPhone,

      createdDate:  formatDateToApi(date.toISOString()),

      expiryDate: formatDateToApiFunction(obj.expiryDate),
      OTPVerified:  obj.OTPVerified,
      plantName: obj.plantName,
      nationalityName: obj.nationalityName,
      status:1, //obj.statusName,
      categoryName: obj.categoryName,
      oldReference:obj.oldReference


    };


    //CCTD
    const obj2 = {
      idNo : obj.idNo,
      plantId: clientIndividualFormValidation.values.plantId ?clientIndividualFormValidation.values.plantId : 3,

      // clientID: obj.clientID,
      idCountryId: obj.idCountry,
      idtId: obj.idtId ,  //5
      idExpiryDate: formatDateToApiFunction(obj.expiryDate),
      issusDate: formatDateToApiFunction(obj.issusDate),
      idCityId: obj.idCity,
      isDiplomat: obj.isDiplomat,

    };



    //CTCLI
    const obj3 = {
      // clientID: obj.clientID,
      firstName: obj.firstName,
      lastName: obj.lastName,
      middleName: obj.middleName,
      familyName: obj.familyName,
      fl_firstName: obj.fl_firstName,
      fl_lastName: obj.fl_lastName,
      fl_middleName: obj.fl_middleName,
      fl_familyName: obj.fl_familyName,
      professionId:obj.professionId,
      birthDate:  formatDateToApiFunction(obj.birthDate),
      isResident: obj.isResident,
      incomeSourceId: obj.incomeSourceId,
      sponsorName: obj.sponsorName,
    };


    const obj4 = {


      salaryRangeId: obj.salaryRangeId,
      riskLevel: obj.riskLevel,
      smsLanguage: obj.smsLanguage,
      whatsAppNo: obj.whatsAppNo,
      gender: obj.gender,
      title: obj.title,
      civilStatus: obj.civilStatus,
      mobileVerificationStatus: 1, //obj.mobileVerified,
      educationLevel: obj.educationLevel,
      isDiplomat: obj.isDiplomat,
      isRelativeDiplomat: obj.isRelativeDiplomat,
      relativeDiplomatInfo: obj.relativeDiplomatInfo,
      OTPVerified: obj.OTPVerified,
      coveredFace: obj.coveredFace,
      isEmployee: obj.isEmployee,

      idNo : obj.idNo,
      wip: 1,
      releaseStatus: 1,
      educationLevelName: obj.educationLevelName,
      statusName: obj.statusName

      // date: obj.date,
    };


     const obj5 = {
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

     const obj6 = {
      name: WorkAddressValidation.values.name,
      countryId: WorkAddressValidation.values.countryId,
      stateId: WorkAddressValidation.values.stateId,
      cityId: WorkAddressValidation.values.cityId,
      cityName: WorkAddressValidation.values.cityName,
      street1: WorkAddressValidation.values.street1,
      street2: WorkAddressValidation.values.street2,
      email1: WorkAddressValidation.values.email1,
      email2: WorkAddressValidation.values.email2,
      phone: WorkAddressValidation.values.phone,
      phone2: WorkAddressValidation.values.phone2,
      phone3: WorkAddressValidation.values.phone3,
      addressId: WorkAddressValidation.values.addressId,
      postalCode:WorkAddressValidation.values.postalCode,
      cityDistrictId: WorkAddressValidation.values.cityDistrictId,
      bldgNo: WorkAddressValidation.values.bldgNo,
      unitNo: WorkAddressValidation.values.unitNo,
      subNo: WorkAddressValidation.values.subNo
     }

    const data = {
      plantId: clientIndividualFormValidation.values.plantId || 3,
      clientMaster: obj1, //CTCL
      clientID: obj2, //CTID
      ClientIndividual: obj3, //CTCLI
      clientRemittance: obj4,
      address: obj5,
      workAddress: (obj6.name && obj6.countryId && obj6.city && obj6.phone && obj6.street1 ) ? obj6 : null

    };

    postRequest({
      extension: RTCLRepository.CtClientIndividual.set2,
      record: JSON.stringify(data),
    })
      .then((res) => {
        if (res){
         toast.success("Record Successfully");
         clientIndividualFormValidation.setFieldValue('clientId' , res.recordId)
        setShowOtpVerification(true)
        setEditMode(true)
        getClient(res.recordId)

        }
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };


  const WorkAddressValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validateOnBlur:true,
    validate : (values) => {
      const errors = {};
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (values.name || values.cityId || values.phone || values.countryId ||  values.street1)  {
        if (!values.name ) {
          errors.name = 'This field is required';
        }
        if (!values.street1 ) {
          errors.street1 = 'This field is required';
        }
        if (!values.countryId ) {
          errors.countryId = 'This field is required';
        }
        if (!values.cityId ) {
          errors.cityId = 'This field is required';
        }
        if (!values.cityId ) {
          errors.phone = 'This field is required';
        }

      }
      if (values.email1  && !emailRegex?.test(values?.email1) ) {
        errors.email1 = 'Invalid email format';
      }

      if (values.email2 && !emailRegex?.test(values?.email2) ) {
        errors.email2 = 'Invalid email format';
      }


      return errors;


    },
    initialValues: {
      name: null,
      countryId: null,
      stateId: null,
      cityId: null,
      city: null,
      street1: null,
      street2: null,
      email1: null,
      email2: null,
      phone: null,
      phone2: null,
      phone3: null,
      addressId: null,
      postalCode:null,
      cityDistrictId: null,
      cityDistrict: null,
      bldgNo: null,
      unitNo: null,
      subNo: null
    },

    // validationSchema:  yup.object({
    //   name:  yup.string().required('This field is required'),
    //   countryId:  yup.string().required('This field is required'),
    //   cityId:  yup.string().required('This field is required'),
    //   street1:  yup.string().required('This field is required'),
    //   phone: yup.string().required('This field is required')
    // }),
    onSubmit: values => {
      // console.log(values);
        setWindowWorkAddressOpen(false)
    }
  })

  // const fetchValidation = useFormik({
  //   enableReinitialize: true,
  //   validateOnChange: true,

  //   initialValues: {
  //     idtId: clientIndividualFormValidation.values?.idtId,
  //     birthDate: clientIndividualFormValidation.values?.birthDate,
  //     idNo: clientIndividualFormValidation.values?.idNo,
  //     idNoRepeat: '',
  //   },

  //   validationSchema:  yup.object({
  //     // birthDate: yup.string().required("This field is required"),
  //     // idtId: yup.string().required("This field is required"),
  //     // idNo:  yup.string().required("This field is required"),
  //     // idNoRepeat : yup.string().required('Repeat Password is required')
  //     // .oneOf([yup.ref('idNo'), null], 'Number must match'),

  //   }),
  //   onSubmit: values => {

  //     postFetchDefault(values)

  //   }
  // })

  // const  postFetchDefault=(obj)=>{
  //   const defaultParams = `_number=${obj.idNo}&_dateTime=${formatDateToApiFunction(obj.birthDate)}&_type=${obj.idtId}`
  //   var parameters = defaultParams
  //   getMicroRequest({
  //     extension: 'getInformation',
  //     parameters: parameters,

  //   })
  //     .then(res => {

  //     })
  //     .catch(error => {
  //       setErrorMessage(error)
  //     })
  // }

  const addClient = async (obj) => {
    clientIndividualFormValidation.setValues(getNewClients());
    WorkAddressValidation.setValues(getNewAddress());

    try {
      const plantId = await getPlantId();

      if (plantId !== '') {
        setEditMode(false);
        setWindowOpen(true);
      } else {
        setErrorMessage({ error: 'The user does not have a default plant' });
      }
    } catch (error) {
      // Handle errors if needed
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
        clientIndividualFormValidation.setFieldValue('plantId', res.record.value);

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
    getClient(_recordId)

  }


  const getClient=(recordId)=>{
    const defaultParams = `_clientId=${recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RTCLRepository.CtClientIndividual.get,
      parameters: parameters
    })
      .then(res => {
        clientIndividualFormValidation.setValues(populateIClients(res.record))
        res.record.workAddressView &&  WorkAddressValidation.setValues(populateAddress(res.record.workAddressView))


        getPlantId()
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleSubmit = (param) => {
    // setShowOtpVerification(true)
    if(param==='fetch'){
      fetchValidation.handleSubmit();
    }else if(param==='address'){
      WorkAddressValidation.handleSubmit();
    }else{
      clientIndividualFormValidation.handleSubmit();
      WorkAddressValidation.handleSubmit();
    }

  };


  const fillType = () => {
    var parameters = `_filter=`;
    getRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.qry,
      parameters: parameters,
    })
      .then((res) => {
        setTypes(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
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

  const fillStateStoreAddressWork = countryId => {
    setStateAddressWorkStore([])
    var parameters = `_countryId=${countryId}`
    getRequest({
      extension: SystemRepository.State.qry,
      parameters: parameters
    })
      .then(res => {
        setStateAddressWorkStore(res.list)
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

  const lookupCity = (searchQry) => {
    setCityStore([]);
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}&_countryId=${clientIndividualFormValidation.values.idCountry}&_stateId=0`;
    getRequest({
      extension: SystemRepository.City.snapshot,
      parameters: parameters,
    })
      .then((res) => {
        // console.log(res.list);
        setCityStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };

  const lookupCityAddress = (searchQry) => {
    setCityAddressStore([]);
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}&_countryId=${clientIndividualFormValidation.values.countryId}&_stateId=${clientIndividualFormValidation.values.stateId || 0}`;
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
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}&_cityId=${clientIndividualFormValidation.values.cityId}`

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

  const lookupCityDistrictAddressWork = searchQry => {
    setCityDistrictAddressWorkStore([])
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}&_cityId=${WorkAddressValidation.values.cityId}`

    getRequest({
      extension: SystemRepository.CityDistrict.snapshot,
      parameters: parameters
    })
      .then(res => {

        setCityDistrictAddressWorkStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const lookupCityAddressWork = (searchQry) => {
    setCityAddressWorkStore([]);
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}&_countryId=${WorkAddressValidation.values.countryId}&_stateId=${WorkAddressValidation.values.stateId || 0}`;
    getRequest({
      extension: SystemRepository.City.snapshot,
      parameters: parameters,
    })
      .then((res) => {

        setCityAddressWorkStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };

  const fillIdTypeStore = () => {
    var parameters = ``;
    getRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.qry,
      parameters: parameters,
    })
      .then((res) => {
        setIdTypeStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };

  const fillProfessionStore = (cId) => {
    var parameters = `_filter=&_isDiplomat=`+cId;
    getRequest({
      extension: RemittanceSettingsRepository.Profession.qry,
      parameters: parameters,
    })
      .then((res) => {
        setProfessionStore(res.list);
        setProfessionFilterStore(res.list)
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };


  const fillSalaryRangeStore = () => {
    var parameters = `_filter=`;
    getRequest({
      extension: RemittanceSettingsRepository.SalaryRange.qry,
      parameters: parameters,
    })
      .then((res) => {
        setSalaryRangeStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };

  const fillIncomeOfSourceStore = () => {
    var parameters = `_filter=`;
    getRequest({
      extension: RemittanceSettingsRepository.SourceOfIncome.qry,
      parameters: parameters,
    })
      .then((res) => {
        setIncomeOfSourceStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };

  const fillEducationStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.EDUCATION_LEVEL,
      callback: setEducationStore
    })
  };

  const fillTitleStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.TITLE,
      callback: setTitleStore
    })
  };

  const fillSMSLanguageStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.LANGUAGE,
      callback: setSMSLanguageStore
    })
  };

  const fillGenderStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.GENDER,
      callback: setGenderStore
    })
  };


  const fillCivilStatusStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.CIVIL_STATUS,
      callback: setCivilStatusStore
    })
  };

  const fillMobileVerifiedStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.MOBILE_VERIFIED,
      callback: setMobileVerifiedStore
    })
  };



  const fillFilterProfession=(value)=>{

    if(value){
      const filteredList =  professionStore.filter(item => item.diplomatStatus === 2);
      clientIndividualFormValidation.setFieldValue('isDiplomat',true )
      clientIndividualFormValidation.setFieldValue('isDiplomatReadOnly',true )
      setProfessionFilterStore(filteredList)
    }else{
      const filteredList =  professionStore;
      clientIndividualFormValidation.setFieldValue('isDiplomat',false )
      clientIndividualFormValidation.setFieldValue('isDiplomatReadOnly',false )

      setProfessionFilterStore(filteredList)
      }

  }
useEffect(()=>{
  if((WorkAddressValidation.values.name || WorkAddressValidation.values.street1 || WorkAddressValidation.values.phone || WorkAddressValidation.values.countryId ||  WorkAddressValidation.values.cityId) && requiredOptional){
    setRequiredOptional(false)
   }

   if((!WorkAddressValidation.values.name && !WorkAddressValidation.values.street1 && !WorkAddressValidation.values.phone && !WorkAddressValidation.values.countryId &&  !WorkAddressValidation.values.cityId)){
    setRequiredOptional(true)
   }
}, [WorkAddressValidation.values])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >



<GridToolbar onAdd={addClient} maxAccess={access}  validation={clientIndividualFormValidation}  onSearch={search} labels={_labels}  inputSearch={true}/>

{gridData &&
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
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
       clientIndividualFormValidation={clientIndividualFormValidation}
       WorkAddressValidation={WorkAddressValidation}
       countryStore={countryStore}
       cityStore={cityStore}
       setCityStore={setCityStore}
       types={types}
       requiredOptional={requiredOptional}
  professionFilterStore={professionFilterStore}
  salaryRangeStore={salaryRangeStore}
  incomeOfSourceStore={incomeOfSourceStore}
  smsLanguageStore={smsLanguageStore}
  civilStatusStore={civilStatusStore}
  genderStore={genderStore}
  mobileVerifiedStore={mobileVerifiedStore}
  educationStore={educationStore}
  idTypeStore={idTypeStore}
  titleStore={titleStore}
  lookupCity={lookupCity}
  fillFilterProfession={fillFilterProfession}
  setWindowWorkAddressOpen={setWindowWorkAddressOpen}
  setWindowConfirmNumberOpen={setWindowConfirmNumberOpen}
  stateAddressStore={stateAddressStore}
  setReferenceRequired={setReferenceRequired}
  _labels ={_labels2}
  maxAccess={access}
  editMode={editMode}



       />

       )

       }

       {windowConfirmNumberOpen &&  <ConfirmNumberWindow labels={_labels2} idTypeStore={idTypeStore} clientIndividualFormValidation={clientIndividualFormValidation}
        onClose={()=>setWindowConfirmNumberOpen(false)} width={400} height={300} />}
       {windowWorkAddressOpen && <AddressWorkWindow labels={_labels2} setShowWorkAddress={setWindowWorkAddressOpen} addressValidation={WorkAddressValidation}  onSave={()=>handleSubmit('address')}  onClose={()=>setWindowWorkAddressOpen(false)} requiredOptional={requiredOptional} readOnly={editMode && true} />}
       {showOtpVerification && <OTPPhoneVerification  formValidation={clientIndividualFormValidation} functionId={"3600"}  onClose={() => setShowOtpVerification(false)} setShowOtpVerification={setShowOtpVerification} setEditMode={setEditMode}  setErrorMessage={setErrorMessage}/>}
       {windowInfo && <TransactionLog  resourceId={ResourceIds && ResourceIds.ClientList}  recordId={clientIndividualFormValidation.values.clientId}  onInfoClose={() => setWindowInfo(false)}
/>}

<ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage}  />

      </Box>


    </>
  )
}

export default ClientsList
