// ** MUI Imports
import { Grid, FormControlLabel, Checkbox, Button, DialogActions } from '@mui/material'

import { useEffect, useState, useContext } from 'react'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Helpers

import AddressTab from 'src/components/Shared/AddressTab'
import FieldSet from 'src/components/Shared/FieldSet'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { TextFieldReference } from 'src/components/Shared/TextFieldReference'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import UseIdType from 'src/hooks/useIdType'
import FormShell from 'src/components/Shared/FormShell'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

import { DataSets } from 'src/resources/DataSets'
import { RequestsContext } from 'src/providers/RequestsContext'
import OTPPhoneVerification from 'src/components/Shared/OTPPhoneVerification'
import { formatDateToApi, formatDateToApiFunction , formatDateFromApi} from 'src/lib/date-helper'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { useWindow } from 'src/windows'
import Confirmation from 'src/components/Shared/Confirmation'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'

const ClientTemplateForm = ({
  setErrorMessage,
  recordId,
   setSelectedRecordId,
   _labels, maxAccess
 }) => {
  const { stack } = useWindow()

  const { getRequest, postRequest } = useContext(RequestsContext)

const [showAsPassword , setShowAsPassword]  = useState(false)
const [showAsPasswordPhone , setShowAsPasswordPhone]  = useState(false)
const [showAsPasswordPhoneRepeat , setShowAsPasswordPhoneRepeat]  = useState(false)
const [referenceRequired, setReferenceRequired] = useState(true)
const [windowWorkAddressOpen , setWindowWorkAddressOpen] = useState(false)
const [requiredOptional, setRequiredOptional] = useState(true)
const [windowConfirmNumberOpen, setWindowConfirmNumberOpen] = useState(false)
const [professionStore, setProfessionStore] = useState([]);
const [professionFilterStore, setProfessionFilterStore] = useState([]);
const [address , setAddress] = useState([])
const [editMode, setEditMode] = useState(null)
const [idTypeStore, setIdTypeStore] = useState([]);

const [initialValues, setInitialData] = useState({
  //clientIDView
  reference: '',

  clientId: '',
  expiryDate: null,
  issusDate: null,
  idCountry: '',
  idCity: '',
  idNo: '',
  idNoRepeat: '',
  idNoEncrypt: '',
  idNoRepeatEncrypt: '',
  idtId:'',
  cityName: '',

  //address
  countryId: '',
  cityId: '',
  city: '',
  stateId: '',
  cityDistrictId :'',
  cityDistrict :'',
  email1: '',
  email2: '',
  name: '',
  phone: '',
  phone2: '',
  phone3: '',
  postalCode: '',
  street1: '',
  street2: '',
  subNo: '',
  unitNo: '',

  //end address
  //clientIndividual
  birthDate: null,
  firstName: '',
  lastName: '',
  middleName: '',
  familyName: '',
  fl_firstName: '',
  fl_lastName: '',
  fl_middleName: '',
  fl_familyName: '',
  isResident: false,
  incomeSourceId: '',

  // end clientIndividual

  //clientMaster
  addressId: '',
  category: '',
  nationalityId: '',
  nationality: '',
  cellPhone:'',
  cellPhoneEncrypt : '',
  cellPhoneRepeatEncrypt : '',
  cellPhoneRepeat:'',
  createdDate  : null,
  isDiplomatReadOnly: false,
  flName  :'',
  keyword  :'',
  otp  :'',
  status  : '',
  plantId  :'',
  name  :'',
  oldReference: '',

  //clientRemittance

  OTPVerified: false,
  addressId: '',
  batchId: '',
  civilStatus: '',
  clientId: '',
  coveredFace: false,
  date: null,
  dtId: '',
  educationLevel:'',
  gender: '',
  idNo: '',
  isDiplomat: false,
  isEmployee:false,
  relativeDiplomatInfo: '',
  releaseStatus: '',
  riskLevel: '',
  salary: '',
  salaryRange: '',
  smsLanguage: '',
  status: '',
  whatsAppNo: '',
  wip: '',
  workAddressId: '',
  title: '',
  mobileVerified: '',
  isRelativeDiplomat: false,
  professionId:'',
   })


  const handleCopy = (event) => {
    event.preventDefault();
  };

  const [getValue] = UseIdType();




  async function checkTypes (value) {
    if(!value){
      clientIndividualFormik.setFieldValue(
        "idtId",
        ''
      );
    }
    const idType = await getValue(value);
    if(idType)
    clientIndividualFormik.setFieldValue(
      "idtId",
      idType
    );
  };

useEffect(()=>{ fillProfessionStore(); fillType()
  console.log(recordId)

  if(recordId){
  getClient(recordId)}
 }, [])

  async  function getClient(recordId){
    console.log(recordId)
  const defaultParams = `_clientId=${recordId}`
  var parameters = defaultParams
 await getRequest({
    extension: RTCLRepository.CtClientIndividual.get,
    parameters: parameters
  })
    .then(res => {
     const obj = res?.record
    obj?.workAddressView && setAddress(obj.workAddressView)

      // getPlantId()
      setInitialData({
        //clientIDView
        reference: obj.clientMaster.reference,
        clientId: obj.clientIDView.clientId,
        expiryDate: obj.clientIDView.idExpiryDate  && formatDateFromApi(obj.clientIDView.idExpiryDate),
        issusDate: obj.clientIDView.idIssusDate  && formatDateFromApi(obj.clientIDView.idIssusDate),
        idCountry: obj.clientIDView.idCountryId,
        idCity: obj.clientIDView.idCityId,
        idNo: obj.clientIDView.idNo,
        idNoRepeat: obj.clientIDView.idNo ,
        idNoEncrypt: obj.clientIDView.idNo && obj.clientIDView.idNo ,
        idNoRepeatEncrypt: obj.clientIDView.idNo && obj.clientIDView.idNo ,

        idtId: obj.clientIDView.idtId,
        isDiplomat: obj.clientIDView.isDiplomat,

        // country: obj.clientIDView.countryName,
        cityName: obj.clientIDView.idCityName,

        //address
        countryId: obj.addressView.countryId,
        cityId: obj.addressView.cityId,
        city: obj.addressView.city,
        stateId: obj.addressView.stateId,
        cityDistrictId :obj.addressView.cityDistrictId,
        cityDistrict :obj.addressView.cityDistrict,

        email1: obj.addressView.email1,
        email2: obj.addressView.email2,
        name: obj.addressView.name,
        phone: obj.addressView.phone,
        phone2: obj.addressView.phone2,
        phone3: obj.addressView.phone3,
        postalCode: obj.addressView.postalCode,
        street1: obj.addressView.street1,
        street2: obj.addressView.street2,
        subNo: obj.addressView.subNo,
        unitNo: obj.addressView.unitNo,

        //end address

        whatsappNo: obj.whatsappNo,
        sponsorName: obj.sponsorName,



        //clientIndividual
        birthDate: obj.clientIndividual.birthDate && formatDateFromApi(obj.clientIndividual.birthDate),
        firstName: obj.clientIndividual.firstName,
        lastName: obj.clientIndividual.lastName,
        middleName: obj.clientIndividual.middleName,
        familyName: obj.clientIndividual.familyName,
        fl_firstName: obj.clientIndividual.fl_firstName,
        fl_lastName: obj.clientIndividual.fl_lastName,
        fl_middleName: obj.clientIndividual.fl_middleName,
        fl_familyName: obj.clientIndividual.fl_familyName,
        isResident: obj.clientIndividual.isResident,
        professionId: obj.clientIndividual.professionId,
        incomeSourceId: obj.clientIndividual.incomeSourceId,
        sponsorName: obj.clientIndividual.sponsorName,

        // end clientIndividual



        //clientMaster
        addressId: obj.clientMaster.addressId,
        category: obj.clientMaster.category,
        nationalityId: obj.clientMaster.nationalityId,
        nationality: obj.clientMaster.nationality,
        cellPhone: obj.clientMaster.cellPhone,
        cellPhoneEncrypt : obj.clientMaster.cellPhone  && obj.clientMaster.cellPhone,
        cellPhoneRepeatEncrypt : obj.clientMaster.cellPhone  &&obj.clientMaster.cellPhone,
        cellPhoneRepeat:obj.clientMaster.cellPhone,
        createdDate  :obj.clientMaster.createdDate,

        // expiryDate  :obj.clientMaster.expiryDate,
        flName  :obj.clientMaster.flName,
        keyword  :obj.clientMaster.keyword,
        otp  :obj.clientMaster.otp,
        status  :obj.clientMaster.status,
        plantId  :obj.clientMaster.plantId,
        name  :obj.clientMaster.name,
        oldReference: obj.clientMaster.oldReference,



        //clientRemittance
       recordId:  recordId,
        OTPVerified: obj.clientRemittance.OTPVerified,
        addressId: obj.clientRemittance.addressId,
        batchId: obj.clientRemittance.batchId,
        civilStatus: obj.clientRemittance.civilStatus,
        clientId: obj.clientRemittance.clientId,
        coveredFace: obj.clientRemittance.coveredFace,
        date: obj.clientRemittance.date,
        dtId: obj.clientRemittance.dtId,
        educationLevel:obj.clientRemittance.educationLevel,
        gender: obj.clientRemittance.gender,
        idNo: obj.clientRemittance.idNo,


        // isDiplomat: obj.clientRemittance.isDiplomat,
        isEmployee: obj.clientRemittance.isEmployee,
        relativeDiplomatInfo: obj.clientRemittance.relativeDiplomatInfo,
        releaseStatus: obj.clientRemittance.releaseStatus,
        riskLevel: obj.clientRemittance.riskLevel,

        // salary: obj.clientRemittance.salary,
        salaryRangeId: obj.clientRemittance.salaryRangeId,
        smsLanguage: obj.clientRemittance.smsLanguage,
        status:obj.clientRemittance.status,
        whatsAppNo: obj.clientRemittance.whatsAppNo,
        wip:obj.clientRemittance.wip,
        workAddressId: obj.clientRemittance.workAddressId,
        title: obj.clientRemittance.title,
        mobileVerified: obj.clientRemittance.mobileVerifiedStatus,
        isRelativeDiplomat: obj.clientRemittance.isRelativeDiplomat,
      })

      setEditMode(true)


    })
    .catch(error => {
      setErrorMessage(error)
    })
}

  const fillProfessionStore = (cId) => {
    var parameters = `_filter=`;
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

  const fillType = () => {
    var parameters = `_filter=`;
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


  const clientIndividualFormik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
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
            postRtDefault(values);
    },
  });


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

      plantId: clientIndividualFormik.values.plantId ?clientIndividualFormik.values.plantId : 3,
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
      plantId: clientIndividualFormik.values.plantId ?clientIndividualFormik.values.plantId : 3,

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
      name: address.name,
      countryId: address.countryId,
      stateId: address.stateId,
      cityId: address.cityId,
      cityName: address.cityName,
      street1: address.street1,
      street2: address.street2,
      email1: address.email1,
      email2: address.email2,
      phone: address.phone,
      phone2: address.phone2,
      phone3: address.phone3,
      addressId: address.addressId,
      postalCode:address.postalCode,
      cityDistrictId: address.cityDistrictId,
      bldgNo: address.bldgNo,
      unitNo: address.unitNo,
      subNo: address.subNo
     }

    const data = {
      plantId: clientIndividualFormik.values.plantId || 3,
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
         clientIndividualFormik.setFieldValue('clientId' , res.recordId)
        stack({
          Component: OTPPhoneVerification,
          props: {
            idTypeStore: idTypeStore,
            formValidation: clientIndividualFormik,
            functionId: 3600,
            clientId: res.record.clientId,
            setEditMode: setEditMode,
            setErrorMessage: setErrorMessage
          },
          width: 400,
          height: 400,
          title : 'Verify My Account'
        })

        setEditMode(true)
        getClient(res.recordId)

        }
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };


  // const WorkAddressFormik = useFormik({
  //   enableReinitialize: true,
  //   validateOnChange: true,
  //   validateOnBlur:true,
  //   validate : (values) => {
  //     const errors = {};
  //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  //     if (values.name || values.cityId || values.phone || values.countryId ||  values.street1)  {
  //       if (!values.name ) {
  //         errors.name = 'This field is required';
  //       }
  //       if (!values.street1 ) {
  //         errors.street1 = 'This field is required';
  //       }
  //       if (!values.countryId ) {
  //         errors.countryId = 'This field is required';
  //       }
  //       if (!values.cityId ) {
  //         errors.cityId = 'This field is required';
  //       }
  //       if (!values.cityId ) {
  //         errors.phone = 'This field is required';
  //       }

  //     }
  //     if (values.email1  && !emailRegex?.test(values?.email1) ) {
  //       errors.email1 = 'Invalid email format';
  //     }

  //     if (values.email2 && !emailRegex?.test(values?.email2) ) {
  //       errors.email2 = 'Invalid email format';
  //     }


  //     return errors;


  //   },
  //   initialValues: {
  //     name: null,
  //     countryId: null,
  //     stateId: null,
  //     cityId: null,
  //     city: null,
  //     street1: null,
  //     street2: null,
  //     email1: null,
  //     email2: null,
  //     phone: null,
  //     phone2: null,
  //     phone3: null,
  //     addressId: null,
  //     postalCode:null,
  //     cityDistrictId: null,
  //     cityDistrict: null,
  //     bldgNo: null,
  //     unitNo: null,
  //     subNo: null
  //   },

  //   onSubmit: values => {
  //       setWindowWorkAddressOpen(false)
  //   }
  // })

  // useEffect(()=>{
  //   if((WorkAddressFormik.values.name || WorkAddressFormik.values.street1 || WorkAddressFormik.values.phone || WorkAddressFormik.values.countryId ||  WorkAddressFormik.values.cityId) && requiredOptional){
  //     setRequiredOptional(false)
  //    }

  //    if((!WorkAddressFormik.values.name && !WorkAddressFormik.values.street1 && !WorkAddressFormik.values.phone && !WorkAddressFormik.values.countryId &&  !WorkAddressFormik.values.cityId)){
  //     setRequiredOptional(true)
  //    }
  // }, [WorkAddressFormik.values])


  const fillFilterProfession=(value)=>{

    if(value){
      const filteredList =  professionStore?.filter(item => item.diplomatStatus === 2);
      clientIndividualFormik.setFieldValue('isDiplomat',true )
      clientIndividualFormik.setFieldValue('isDiplomatReadOnly',true )
      setProfessionFilterStore(filteredList)
    }else{
      const filteredList =  professionStore;
      clientIndividualFormik.setFieldValue('isDiplomat',false )
      clientIndividualFormik.setFieldValue('isDiplomatReadOnly',false )
      setProfessionFilterStore(filteredList)
      }

  }

return (
        <FormShell
        resourceId={ResourceIds.ClientList}
        form={clientIndividualFormik}
        height={500}
        maxAccess={maxAccess}
        editMode={editMode} disabledSubmit={editMode} clientRelation={true}>
        <Grid container spacing={4}>
        <Grid container xs={12} spacing={2} sx={{ padding: "20px" }}>
        <Grid item xs={6} sx={{ padding: "30px" }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
            <TextFieldReference
                endpointId={CurrencyTradingSettingsRepository.Defaults.get}
                param={'ct-nra-individual'}
                name="reference"
                label={_labels.reference}
                editMode={editMode}

                 value={clientIndividualFormik.values?.reference}
                setReferenceRequired={setReferenceRequired}
                onChange={clientIndividualFormik.handleChange}
                onClear={() =>
                  clientIndividualFormik.setFieldValue("reference", "")
                }
                error={
                  clientIndividualFormik.touched.reference &&
                  Boolean(clientIndividualFormik.errors.reference)
                }
                helperText={
                  clientIndividualFormik.touched.reference &&
                  clientIndividualFormik.errors.reference
                }
                maxAccess={maxAccess}
              />

            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isResident"
                    checked={clientIndividualFormik.values?.isResident}
                    onChange={clientIndividualFormik.handleChange}
                    disabled={editMode && true}

                  />
                }
                label={_labels.isResident}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name="birthDate"
                label={_labels.birthDate}
                value={clientIndividualFormik.values?.birthDate}
                required={true}
                onChange={clientIndividualFormik.setFieldValue}
                onClear={() =>
                  clientIndividualFormik.setFieldValue("birthDate", "")
                }
                disabledDate={'>='}
                readOnly={editMode && true}

                error={
                  clientIndividualFormik.touched.birthDate &&
                  Boolean(clientIndividualFormik.errors.birthDate)
                }
                helperText={
                  clientIndividualFormik.touched.birthDate &&
                  clientIndividualFormik.errors.birthDate
                }

                maxAccess={maxAccess}
              />
            </Grid>
            <Grid container xs={12}></Grid>
            <Grid item xs={12}>
              <FieldSet title={_labels.id}>

                <Grid item xs={12} >
                  <CustomTextField
                  sx={{color: 'white'}}
                    name="idNo"
                    label={_labels.number}
                    type={ showAsPassword && "password"}
                    value={clientIndividualFormik.values?.idNo}
                    required
                    onChange={ (e) =>{ clientIndividualFormik.handleChange(e)}}
                    onCopy={handleCopy}
                    onPaste={handleCopy}
                    onBlur={(e) =>{ checkTypes(e.target.value) , setShowAsPassword(true)}}
                    readOnly={editMode && true}
                    maxLength="15"
                    onFocus={(e) =>{ setShowAsPassword(false) }}

                    onClear={() =>{
                      clientIndividualFormik.setFieldValue("idNo", "")

                    }

                    }
                    error={
                      clientIndividualFormik.touched.idNo &&
                      Boolean(clientIndividualFormik.errors.idNo)
                    }
                    helperText={
                      clientIndividualFormik.touched.idNo &&
                      clientIndividualFormik.errors.idNo
                    }
                    maxAccess={maxAccess}
                  />
                   </Grid>
                <Grid item xs={12}>
                  <CustomComboBox
                    name="idtId"
                    label={_labels.type}
                    valueField="recordId"
                    displayField="name"
                    readOnly={editMode && true}
                    store={idTypeStore}
                    value={ clientIndividualFormik.values.idtId &&
                      idTypeStore.filter(
                        (item) =>
                          item.recordId ===
                          clientIndividualFormik.values.idtId,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {

                        if(newValue){
                        fillFilterProfession(newValue.isDiplomat)
                        }else{
                        fillFilterProfession('')
                        }

                      if(newValue){

                      clientIndividualFormik.setFieldValue(
                        "idtId",
                        newValue?.recordId,
                      );
                      }else{

                        clientIndividualFormik.setFieldValue(
                          "idtId",
                          '',
                        );


                      }
                    }}
                    error={
                      clientIndividualFormik.touched.idtId &&
                      Boolean(clientIndividualFormik.errors.idtId)
                    }
                    helperText={
                      clientIndividualFormik.touched.idtId &&
                      clientIndividualFormik.errors.idtId
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>



                <Grid item xs={12}>
               <Button  variant='contained' onClick={()=>stack({
                  Component: Confirmation ,
                  props: {
                    idTypeStore: idTypeStore,
                    formik: clientIndividualFormik,
                    labels : _labels
                  },
                  title: _labels.fetch,
                  width: 400,
                  height: 400,

                  // title: 'Cash Invoice'
                  })} disabled={ (!clientIndividualFormik?.values?.idtId || !clientIndividualFormik?.values?.birthDate || !clientIndividualFormik.values.idNo || editMode ) ? true : false}>{_labels.fetch}</Button>
                </Grid>

                <Grid item xs={12}>
                  <CustomDatePicker
                    name="expiryDate"
                    label={_labels.expiryDate}
                    value={clientIndividualFormik.values?.expiryDate}
                    readOnly={editMode && true}
                    required={true}
                    onChange={clientIndividualFormik.setFieldValue}
                    onClear={() =>
                      clientIndividualFormik.setFieldValue(
                        "expiryDate",
                        "",
                      )
                    }
                    disabledDate={!editMode && '<'}
                    error={
                      clientIndividualFormik.touched.expiryDate &&
                      Boolean(clientIndividualFormik.errors.expiryDate)
                    }
                    helperText={
                      clientIndividualFormik.touched.expiryDate &&
                      clientIndividualFormik.errors.expiryDate
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomDatePicker
                    name="issusDate"
                    label={_labels.issusDate}
                    value={clientIndividualFormik.values?.issusDate}
                    readOnly={editMode && true}
                    disabledDate={'>'}
                    onChange={clientIndividualFormik.handleChange}
                    onClear={() =>
                      clientIndividualFormik.setFieldValue(
                        "issusDate",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormik.touched.issusDate &&
                      Boolean(clientIndividualFormik.errors.issusDate)
                    }
                    helperText={
                      clientIndividualFormik.touched.issusDate &&
                      clientIndividualFormik.errors.issusDate
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Country.qry}
                    name="idCountry"
                    label={_labels.issusCountry}
                    valueField="recordId"
                    displayField={['reference','name','flName']}
                    readOnly={editMode && true}
                    columnsInDropDown= {[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'Foreign Language Name' }
                    ]}
                    values={clientIndividualFormik.values}

                    required
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormik.setFieldValue(
                        "idCountry",
                        newValue?.recordId,
                      );



                      clientIndividualFormik.setFieldValue(
                        "idCity",
                        ''
                      );
                      clientIndividualFormik.setFieldValue(
                        "cityName",
                        ''
                      );


                    }else{

                        clientIndividualFormik.setFieldValue(
                          "idCountry",
                          ''
                        );



                        clientIndividualFormik.setFieldValue(
                          "idCity",
                          ''
                        );
                        clientIndividualFormik.setFieldValue(
                          "cityName",
                          ''
                        );


                      }
                    }}
                    error={
                      clientIndividualFormik.touched.idCountry &&
                      Boolean(clientIndividualFormik.errors.idCountry)
                    }
                    helperText={
                      clientIndividualFormik.touched.idCountry &&
                      clientIndividualFormik.errors.idCountry
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>


                <Grid item xs={12}>
            <ResourceLookup
                endpointId={SystemRepository.City.snapshot}
                parameters={{
                  _countryId: clientIndividualFormik.values.idCountry,
                  _stateId:  0
                }}

              name='idCity'
              label={_labels.issusPlace}
              form={clientIndividualFormik}
              valueField='name'
              displayField='name'

              // onLookup={lookupCity}
              firstValue={clientIndividualFormik.values.cityName}
              secondDisplayField={false}
              readOnly={(editMode || !clientIndividualFormik.values.idCountry) && true}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                if (newValue) {
                  clientIndividualFormik.setFieldValue(
                    "idCity",
                    newValue?.recordId,
                  );
                  clientIndividualFormik.setFieldValue(
                    "cityName",
                    newValue?.name,
                  );
                } else {
                  clientIndividualFormik.setFieldValue(
                    "idCity",
                    null,
                  );
                  clientIndividualFormik.setFieldValue(
                    "cityName",
                    null,
                  );
                }
              }}
              error={
                clientIndividualFormik.touched.idCity &&
                Boolean(clientIndividualFormik.errors.idCity)
              }
              helperText={
                clientIndividualFormik.touched.idCity &&
                clientIndividualFormik.errors.idCity
              }
            />
          </Grid>



              </FieldSet>
              <Grid item xs={12} sx={{marginTop:'20px'}}>
                <FieldSet title={_labels.address}>
               <AddressTab labels={_labels} addressValidation={clientIndividualFormik}  readOnly={editMode && true} />
               </FieldSet>



              </Grid>
            </Grid>
          </Grid>

        </Grid>

        <Grid item xs={6}>
          <Grid container xs={12} spacing={2}>

            <Grid container xs={12} >
              <FieldSet title={_labels.customerInformation}>
              <Grid item xs={6} sx={{position: 'relative', width: '100%'}}>
                <CustomTextField
                  name="cellPhone"
                  type={showAsPasswordPhone && "password"}
                  phone={true}
                  label={_labels.cellPhone}
                  value={clientIndividualFormik.values?.cellPhone}
                  readOnly={editMode && true}
                  required
                  onChange={clientIndividualFormik.handleChange}
                  maxLength="15"

                  onCopy={handleCopy}
                  onPaste={handleCopy}

                  onBlur={(e) =>{ setShowAsPasswordPhone(true) , clientIndividualFormik.handleBlur(e)}}
                  onFocus={(e) =>{ setShowAsPasswordPhone(false) }}
                  onClear={() =>
                    clientIndividualFormik.setFieldValue(
                      "cellPhone",
                      "",
                    )
                  }
                  error={
                    clientIndividualFormik.touched.cellPhone &&
                    Boolean(clientIndividualFormik.errors.cellPhone)
                  }
                  helperText={
                    clientIndividualFormik.touched.cellPhone &&
                    clientIndividualFormik.errors.cellPhone
                  }
                  maxAccess={maxAccess}
                />

              </Grid>
              <Grid item xs={6} sx={{position: 'relative', width: '100%'}}>
                <CustomTextField
                  name="cellPhoneRepeat"
                  type={showAsPasswordPhoneRepeat && 'password'}
                  label={_labels.confirmCell}
                  value={clientIndividualFormik.values?.cellPhoneRepeat}
                  phone={true}
                  required
                  readOnly={editMode && true}
                  maxLength="15"
                  onChange={ (e) =>{ clientIndividualFormik.handleChange(e)  }}
                  onBlur={(e) =>{ setShowAsPasswordPhoneRepeat(true) , clientIndividualFormik.handleBlur(e)}}
                  onFocus={(e) =>{ setShowAsPasswordPhoneRepeat(false) }}


                  onCopy={handleCopy}
                  onPaste={handleCopy}
                  onClear={() =>
                    clientIndividualFormik.setFieldValue(
                      "cellPhoneRepeat",
                      "",
                    )
                  }
                  error={
                    clientIndividualFormik.touched.cellPhoneRepeat &&
                    Boolean(clientIndividualFormik.errors.cellPhoneRepeat)
                  }


                  helperText={
                    clientIndividualFormik.touched.cellPhoneRepeat &&
                    clientIndividualFormik.errors.cellPhoneRepeat
                  }
                  maxAccess={maxAccess}
                />

              </Grid>
              <Grid container  spacing={2} sx={{paddingTop: '20px'}} >
                <Grid item xs={3}>
                  <CustomTextField
                    name="firstName"
                    label={_labels.first}
                    value={clientIndividualFormik.values?.firstName}
                    required
                    onChange={clientIndividualFormik.handleChange}
                    maxLength="10"
                    readOnly={editMode && true}
                    onClear={() =>
                      clientIndividualFormik.setFieldValue(
                        "firstName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormik.touched.firstName &&
                      Boolean(clientIndividualFormik.errors.firstName)
                    }
                    helperText={
                      clientIndividualFormik.touched.firstName &&
                      clientIndividualFormik.errors.firstName
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="middleName"
                    label={_labels.middle}
                    value={clientIndividualFormik.values?.middleName}
                    onChange={clientIndividualFormik.handleChange}
                    maxLength="10"
                    readOnly={editMode && true}
                    onClear={() =>
                      clientIndividualFormik.setFieldValue(
                        "middleName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormik.touched.middleName &&
                      Boolean(clientIndividualFormik.errors.middleName)
                    }
                    helperText={
                      clientIndividualFormik.touched.middleName &&
                      clientIndividualFormik.errors.middleName
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="lastName"
                    label={_labels.last}
                    value={clientIndividualFormik.values?.lastName}
                    required
                    onChange={clientIndividualFormik.handleChange}
                    maxLength="10"
                    readOnly={editMode && true}
                    onClear={() =>
                      clientIndividualFormik.setFieldValue(
                        "lastName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormik.touched.lastName &&
                      Boolean(clientIndividualFormik.errors.lastName)
                    }
                    helperText={
                      clientIndividualFormik.touched.lastName &&
                      clientIndividualFormik.errors.lastName
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="familyName"
                    label={_labels.family}
                    value={clientIndividualFormik.values?.familyName}
                    onChange={clientIndividualFormik.handleChange}
                    maxLength="10"
                    readOnly={editMode && true}
                    onClear={() =>
                      clientIndividualFormik.setFieldValue(
                        "familyName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormik.touched.familyName &&
                      Boolean(clientIndividualFormik.errors.familyName)
                    }
                    helperText={
                      clientIndividualFormik.touched.familyName &&
                      clientIndividualFormik.errors.familyName
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>

                </Grid>



  <Grid container  spacing={2} sx={{ flexDirection: 'row-reverse' , paddingTop:'5px'}} >
  <Grid item xs={3}>
                  <CustomTextField
                    name="fl_firstName"
                    label={_labels.fl_first}
                    value={clientIndividualFormik.values?.fl_firstName}
                    onChange={clientIndividualFormik.handleChange}
                    maxLength="10"
                    readOnly={editMode && true}
                    dir='rtl'// Set direction to right-to-left

                    onClear={() =>
                      clientIndividualFormik.setFieldValue(
                        "fl_firstName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormik.touched.fl_firstName &&
                      Boolean(
                        clientIndividualFormik.errors.fl_firstName,
                      )
                    }
                    helperText={
                      clientIndividualFormik.touched.fl_firstName &&
                      clientIndividualFormik.errors.fl_firstName
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="fl_middleName"
                    label={_labels.fl_middle}
                    value={clientIndividualFormik.values?.fl_middleName}
                    onChange={clientIndividualFormik.handleChange}
                    readOnly={editMode && true}
                    dir='rtl'// Set direction to right-to-left

                    onClear={() =>
                      clientIndividualFormik.setFieldValue(
                        "fl_familyName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormik.touched.fl_middleName &&
                      Boolean(
                        clientIndividualFormik.errors.fl_middleName,
                      )
                    }
                    helperText={
                      clientIndividualFormik.touched.fl_middleName &&
                      clientIndividualFormik.errors.fl_middleName
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={3}>
                <CustomTextField
                    name="fl_lastName"
                    label={_labels.fl_last}
                    value={clientIndividualFormik.values?.fl_lastName}
                    onChange={clientIndividualFormik.handleChange}
                    maxLength="10"
                    dir='rtl'// Set direction to right-to-left

                    readOnly={editMode && true}
                    onClear={() =>
                      clientIndividualFormik.setFieldValue(
                        "fl_lastName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormik.touched.fl_lastName &&
                      Boolean(clientIndividualFormik.errors.fl_lastName)
                    }
                    helperText={
                      clientIndividualFormik.touched.fl_lastName &&
                      clientIndividualFormik.errors.fl_lastName
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="fl_familyName"
                    label={_labels.fl_family}
                    value={clientIndividualFormik.values?.fl_familyName}
                    onChange={clientIndividualFormik.handleChange}
                    readOnly={editMode && true}
                    dir='rtl'// Set direction to right-to-left

                    onClear={() =>
                      clientIndividualFormik.setFieldValue(
                        "fl_familyName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormik.touched.fl_familyName &&
                      Boolean(
                        clientIndividualFormik.errors.fl_familyName,
                      )
                    }
                    helperText={
                      clientIndividualFormik.touched.fl_familyName &&
                      clientIndividualFormik.errors.fl_familyName
                    }
                  />
                </Grid>




                </Grid>
                <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.Country.qry}
                  name="nationalityId"
                  label={_labels.nationality}
                  valueField="recordId"
                   displayField={['reference','name','flName']}

                  columnsInDropDown= {[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' },
                    { key: 'flName', value: 'Foreign Language Name' }
                  ]}
                  readOnly={editMode && true}
                  values={clientIndividualFormik.values }
                  required
                  onChange={(event, newValue) => {

                    if(newValue){
                    clientIndividualFormik.setFieldValue(
                      "nationalityId",
                      newValue?.recordId,
                    );
                   }else{

                      clientIndividualFormik.setFieldValue(
                        "nationalityId",
                        ''
                      );


                    }
                  }}
                  error={
                    clientIndividualFormik.touched.nationalityId &&
                    Boolean(clientIndividualFormik.errors.nationalityId)
                  }
                  helperText={
                    clientIndividualFormik.touched.nationalityId &&
                    clientIndividualFormik.errors.nationalityId
                  }
                />
              </Grid>


            <Grid item xs={12}>
                  <ResourceComboBox

                  datasetId={DataSets.GENDER}
                    name="gender"
                    label={_labels.gender}
                    valueField="key"
                    displayField="value"
                    required
                    readOnly={editMode && true}
                    values={clientIndividualFormik.values}
                    onChange={(event, newValue) => {
                      clientIndividualFormik.setFieldValue(
                        "coveredFace", false
                      );
                      if(newValue){
                      clientIndividualFormik.setFieldValue(
                        "gender",
                        newValue?.key,
                      );

                      if(newValue.key ==='2'){
                        clientIndividualFormik.setFieldValue(
                          "coveredFace", true
                        );
                      }

                    }else{

                      clientIndividualFormik.setFieldValue(
                        "gender",
                        '',
                      );


                    }
                    }}
                    error={
                      clientIndividualFormik.touched.gender &&
                      Boolean(clientIndividualFormik.errors.gender)
                    }
                    helperText={
                      clientIndividualFormik.touched.gender &&
                      clientIndividualFormik.errors.gender
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                   datasetId={DataSets.EDUCATION_LEVEL}

                    name="educationLevel"
                    label={_labels.educationLevel}
                    valueField="key"
                    displayField="value"
                    readOnly={editMode && true}

                    values={
                      clientIndividualFormik.values
                    }


                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormik.setFieldValue(
                        "educationLevel",
                        newValue?.key,
                      );

                    }else{
                      clientIndividualFormik.setFieldValue(
                        "educationLevel",
                        null,
                      );


                      }
                    }}
                    error={
                      clientIndividualFormik.touched.educationLevel &&
                      Boolean(
                        clientIndividualFormik.errors.educationLevel,
                      )
                    }
                    helperText={
                      clientIndividualFormik.touched.educationLevel &&
                      clientIndividualFormik.errors.educationLevel
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={RemittanceSettingsRepository.SourceOfIncome.qry}
                    name="incomeSourceId"
                    label={_labels.incomeSource}
                    valueField="recordId"
                    readOnly={editMode && true}
                    displayField={['reference','name','flName']}
                    columnsInDropDown= {[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'Foreign Language Name' }
                    ]}
                    values={clientIndividualFormik.values}
                    required
                    onChange={(event, newValue) => {
                      if(newValue){
                      clientIndividualFormik.setFieldValue(
                        "incomeSourceId",
                        newValue?.recordId,
                      );
                      }else{
                        clientIndividualFormik.setFieldValue(
                          "incomeSourceId",
                          '',
                        );

                      }

                    }}
                    error={
                      clientIndividualFormik.touched.incomeSourceId &&
                      Boolean(
                        clientIndividualFormik.errors.incomeSourceId,
                      )
                    }
                    helperText={
                      clientIndividualFormik.touched.incomeSourceId &&
                      clientIndividualFormik.errors.incomeSourceId
                    }
                  />
                </Grid>




                <Grid item xs={12}>
                  <CustomTextField
                    name="sponsorName"
                    label={_labels.sponsorName}
                    value={clientIndividualFormik.values?.sponsorName}
                    readOnly={editMode && true}
                    onChange={clientIndividualFormik.handleChange}
                    maxLength="15"
                    onClear={() =>
                      clientIndividualFormik.setFieldValue(
                        "sponsorName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormik.touched.sponsorName &&
                      Boolean(clientIndividualFormik.errors.sponsorName)
                    }
                    helperText={
                      clientIndividualFormik.touched.sponsorName &&
                      clientIndividualFormik.errors.sponsorName
                    }
                  />
                </Grid>
                <Grid item xs={12} >
                <CustomComboBox
                  name="professionId"
                  label={_labels.profession}
                  valueField="recordId"
                  displayField={['reference','name','flName']}

                  columnsInDropDown= {[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' },
                    { key: 'flName', value: 'Foreign Language Name' }
                  ]}
                  store={professionFilterStore}
                  readOnly={editMode && true}
                  value={ professionFilterStore && clientIndividualFormik.values.professionId &&
                    professionFilterStore?.filter(
                      (item) =>
                        item.recordId ===
                        clientIndividualFormik.values.professionId,
                    )[0]
                  }
                  required
                  onChange={(event, newValue) => {
                    if(newValue){
                    clientIndividualFormik.setFieldValue(
                      "professionId",
                      newValue?.recordId,
                    );}else{
                      clientIndividualFormik.setFieldValue(
                        "professionId",
                        ''
                      );

                    }


                  }}
                  error={
                    clientIndividualFormik.touched.professionId &&
                    Boolean(clientIndividualFormik.errors.professionId)
                  }
                  helperText={
                    clientIndividualFormik.touched.professionId &&
                    clientIndividualFormik.errors.professionId
                  }
                />
              </Grid>
              </FieldSet>
              <Grid item xs={12}>
              <Button variant='contained'
              onClick={()=>stack({
                Component: AddressFormShell,
                props: {
                  // addressValidation: WorkAddressFormik,
                  readOnly: editMode,
                  requiredOptional: requiredOptional,
                  labels: _labels,
                  setAddress: setAddress,
                  address: address
                },
                width: 500,
                height: 400,

                // title: 'Cash Invoice'
                })}

              // onClick={()=> stack({
              //     component: AddressTab,
              //     props: {
              //       addressValidation: WorkAddressFormik,
              //       readOnly: editMode,
              //       requiredOptional: requiredOptional,
              //       labels : _labels
              //     },
              //     width: 400,
              //     height: 400,
              //     title: _labels.workAddress
              //     })}
                  >{_labels.workAddress}</Button>
              </Grid>


              <Grid container xs={12} spacing={2} sx={{p:5}} >
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={RemittanceSettingsRepository.SalaryRange.qry}
                    name="salaryRangeId"
                    label={_labels.salaryRange}
                    valueField="recordId"
                    displayField={["min", "->",  "max"]}
                    columnsInDropDown={[
                      { key: "min", value: "min" },
                      { key: "max", value: "max" },
                    ]}
                    readOnly={editMode && true}
                    values={clientIndividualFormik.values }
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormik.setFieldValue(
                        "salaryRangeId",
                        newValue?.recordId,
                      );

                    }else{
                      clientIndividualFormik.setFieldValue(
                        "salaryRangeId",
                        '',
                      );


                    }
                    }}
                    error={
                      clientIndividualFormik.touched.salaryRangeId &&
                      Boolean(
                        clientIndividualFormik.errors.salaryRangeId,
                      )
                    }
                    helperText={
                      clientIndividualFormik.touched.salaryRangeId &&
                      clientIndividualFormik.errors.salaryRangeId
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={CurrencyTradingSettingsRepository.RiskLevel.qry}
                    name="riskLevel"
                    label={_labels.riskLevel}
                    readOnly={editMode && true}
                    valueField="recordId"
                    displayField={['reference','name']}

                  columnsInDropDown= {[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' },
                  ]}

                    values={clientIndividualFormik.values}
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormik.setFieldValue(
                        "riskLevel",
                        newValue?.recordId,
                      );
                     }else{

                        clientIndividualFormik.setFieldValue(
                          "riskLevel",
                          null,
                        );


                      }
                    }}
                    error={
                      clientIndividualFormik.touched.riskLevel &&
                      Boolean(clientIndividualFormik.errors.riskLevel)
                    }
                    helperText={
                      clientIndividualFormik.touched.riskLevel &&
                      clientIndividualFormik.errors.riskLevel
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                                      datasetId={DataSets.LANGUAGE}

                    name="smsLanguage"
                    label={_labels.smsLanguage}
                    valueField="key"
                    displayField="value"
                    values={clientIndividualFormik.values}
                    required

                    readOnly={editMode && true}
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormik.setFieldValue(
                        "smsLanguage",
                        newValue?.key,
                      );

                    }else{

                        clientIndividualFormik.setFieldValue(
                          "smsLanguage",
                          '',
                        );

                      }
                    }}
                    error={
                      clientIndividualFormik.touched.smsLanguage &&
                      Boolean(
                        clientIndividualFormik.errors.smsLanguage,
                      )
                    }
                    helperText={
                      clientIndividualFormik.touched.smsLanguage &&
                      clientIndividualFormik.errors.smsLanguage
                    }
                  />
                </Grid>



                <Grid item xs={12}>
                  <ResourceComboBox
                   datasetId={DataSets.CIVIL_STATUS}
                    name="civilStatus"
                    label={_labels.civilStatus}
                    valueField="key"
                    displayField="value"
                    values={clientIndividualFormik.values}
                    readOnly={editMode && true}
                    onChange={(event, newValue) => {

                      if(newValue){
                        clientIndividualFormik.setFieldValue(
                          "civilStatus",
                          newValue?.key,
                        );

                      }else{
                      clientIndividualFormik.setFieldValue(
                        "civilStatus",
                        newValue?.key,
                      );


                      }
                    }}
                    error={
                      clientIndividualFormik.touched.civilStatus &&
                      Boolean(
                        clientIndividualFormik.errors.civilStatus,
                      )
                    }
                    helperText={
                      clientIndividualFormik.touched.civilStatus &&
                      clientIndividualFormik.errors.civilStatus
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                <CustomTextField
                  name="statusName"
                  label={_labels.status}
                  value={clientIndividualFormik.values?.statusName}
                  type="number"
                  onChange={clientIndividualFormik.handleChange}
                  maxLength="10"
                  onClear={() =>
                    clientIndividualFormik.setFieldValue("statusName", "")
                  }
                  readonly={true}

                  error={
                    clientIndividualFormik.touched.statusName &&
                    Boolean(clientIndividualFormik.errors.statusName)
                  }
                  helperText={
                    clientIndividualFormik.touched.statusName &&
                    clientIndividualFormik.errors.statusName
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  name="oldReference"
                  label={_labels.oldReference}
                  value={clientIndividualFormik.values?.oldReference}
                  readOnly={editMode && true}
                  onChange={clientIndividualFormik.handleChange}
                  maxLength="10"
                  onClear={() =>
                    clientIndividualFormik.setFieldValue(
                      "oldReference",
                      "",
                    )
                  }
                  error={
                    clientIndividualFormik.touched.oldReference &&
                    Boolean(clientIndividualFormik.errors.oldReference)
                  }
                  helperText={
                    clientIndividualFormik.touched.oldReference &&
                    clientIndividualFormik.errors.oldReference
                  }
                />
              </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    name="whatsAppNo"
                    label={_labels.whatsapp}
                    value={clientIndividualFormik.values?.whatsAppNo}
                    readOnly={editMode && true}
                    onChange={clientIndividualFormik.handleChange}
                    maxLength="15"
                    onClear={() =>
                      clientIndividualFormik.setFieldValue(
                        "whatsAppNo",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormik.touched.whatsAppNo &&
                      Boolean(clientIndividualFormik.errors.whatsAppNo)
                    }
                    helperText={
                      clientIndividualFormik.touched.whatsAppNo &&
                      clientIndividualFormik.errors.whatsAppNo
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.TITLE}
                    name="title"
                    label={_labels.title}
                    valueField="key"
                    displayField="value"
                    readOnly={editMode && true}
                    values={clientIndividualFormik.values}
                      onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormik.setFieldValue(
                        "title",
                        newValue?.key,
                      );

                      }else{
                        clientIndividualFormik.setFieldValue(
                          "title",
                          null,
                        );

                      }
                    }}
                    error={
                      clientIndividualFormik.touched.title &&
                      Boolean(clientIndividualFormik.errors.title )
                    }
                    helperText={
                      clientIndividualFormik.touched.title &&
                      clientIndividualFormik.errors.title
                    }
                  />
                </Grid>
              </Grid>

            </Grid>




          </Grid>
        </Grid>
        <Grid container spacing={2}  sx={{m :0}}>
              <Grid container xs={6} spacing={2}  sx={{p:5}} >
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="OTPVerified"
                        disabled={true}
                        readOnly={editMode && true}
                        checked={clientIndividualFormik.values?.OTPVerified}
                        onChange={clientIndividualFormik.handleChange}
                      />
                    }
                    label={_labels?.OTPVerified}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.MOBILE_VERIFIED}
                    name="mobileVerified"
                    label={_labels.mobileVerified}
                    valueField="key"
                    displayField="value"
                    values={clientIndividualFormik.values}
                    onChange={(event, newValue) => {
                      clientIndividualFormik.setFieldValue(
                        "mobileVerified",
                        newValue?.recordId,
                      );

                    }}
                    error={
                      clientIndividualFormik.touched.mobileVerified &&
                      Boolean(
                        clientIndividualFormik.errors.mobileVerified,
                      )
                    }
                    helperText={
                      clientIndividualFormik.touched.mobileVerified &&
                      clientIndividualFormik.errors.mobileVerified
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox

                         disabled={clientIndividualFormik.values.gender === "2" && !editMode ?  false :  true}
                        name="coveredFace"
                        checked={clientIndividualFormik.values.coveredFace

                          // clientIndividualFormik.values.gender === "2" && !clientIndividualFormik.values.coveredFace  ? true :  clientIndividualFormik.values.coveredFace
                        }
                        onChange={clientIndividualFormik.handleChange}
                      />
                    }
                    label={_labels?.coveredFace}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isEmployee"
                        disabled={editMode && true}
                        checked={
                          clientIndividualFormik.values?.isEmployee
                        }
                        onChange={clientIndividualFormik.handleChange}
                      />
                    }
                    label={_labels?.isEmployed}
                  />
                </Grid>
              </Grid>

              <Grid container xs={6} spacing={2} sx={{pt:5}} >
                <Grid container xs={12}>
                  <FieldSet title={_labels.diplomat}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={

                          <Checkbox
                            name="isDiplomat"
                            checked={
                              clientIndividualFormik.values?.isDiplomat
                            }

                            disabled={(clientIndividualFormik.values?.isDiplomatReadOnly || editMode) && true}
                            onChange={
                              clientIndividualFormik.handleChange
                            }
                          />
                        }
                        label={_labels?.isDiplomat}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="isRelativeDiplomat"
                            checked={
                              clientIndividualFormik.values?.isRelativeDiplomat
                            }
                            disabled={editMode && true}

                            onChange={(e)=>{
                              clientIndividualFormik.handleChange(e), clientIndividualFormik.setFieldValue('relativeDiplomatInfo', '') }
                            }
                          />
                        }
                        label={_labels?.isDiplomatRelative}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name="relativeDiplomatInfo"
                        label={_labels.relativeDiplomatInfo}
                        onBlur={clientIndividualFormik.handleBlur}
                        value={
                          clientIndividualFormik.values?.relativeDiplomatInfo
                        }
                        readOnly={editMode || !clientIndividualFormik.values?.isRelativeDiplomat  && true}

                        onChange={clientIndividualFormik.handleChange}
                        maxLength="10"
                        required={clientIndividualFormik.values.isRelativeDiplomat ? true : false}
                        onClear={() =>
                         clientIndividualFormik.setFieldValue(
                            "relativeDiplomatInfo",
                            "",
                          )
                        }
                        error={
                          clientIndividualFormik.touched
                            .relativeDiplomatInfo &&
                          Boolean(
                            clientIndividualFormik.errors
                              .relativeDiplomatInfo,
                          )
                        }
                        helperText={
                          clientIndividualFormik.touched
                            .relativeDiplomatInfo &&
                          clientIndividualFormik.errors
                            .relativeDiplomatInfo
                        }
                      />
                    </Grid>
                  </FieldSet>
                </Grid>
              </Grid>


             </Grid>
        <Grid
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            padding: 3,
            textAlign: "center",
          }}
        >
        </Grid>
      </Grid>
            </Grid>
            {/* {windowConfirmNumberOpen &&  <ConfirmNumberWindow labels={_labels} idTypeStore={idTypeStore} formik={clientIndividualFormik}        onSave={()=>handleSubmit('fetch')} */}
        {/* onClose={()=>setWindowConfirmNumberOpen(false)} width={400} height={300} />} */}
               {/* {windowWorkAddressOpen && <AddressWorkWindow labels={_labels} setShowWorkAddress={setWindowWorkAddressOpen} addressValidation={WorkAddressFormik}  onSave={()=>handleSubmit('address')}  onClose={()=>setWindowWorkAddressOpen(false)} requiredOptional={requiredOptional} readOnly={editMode && true} />} */}
               {/* {showOtpVerification && <OTPPhoneVerification  formValidation={clientIndividualFormik} functionId={"3600"}  onClose={() => setShowOtpVerification(false)} setShowOtpVerification={setShowOtpVerification} setEditMode={setEditMode}  setErrorMessage={setErrorMessage}/>} */}

        </FormShell>
    )
}

export default ClientTemplateForm
