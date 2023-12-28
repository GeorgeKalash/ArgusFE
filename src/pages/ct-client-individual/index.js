// ** React Imports
import { useEffect, useState, useContext } from "react";

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from "@mui/material";
import { Paper, Typography } from "@mui/material";

// ** Third Party Imports
import { useFormik } from "formik";
import * as yup from "yup";
import toast from "react-hot-toast";

// ** Custom Imports
import CustomComboBox from "src/components/Inputs/CustomComboBox";
import ErrorWindow from "src/components/Shared/ErrorWindow";
import WindowToolbar from "src/components/Shared/WindowToolbar";
import CustomTextField from "src/components/Inputs/CustomTextField";
import CustomDatePicker from "src/components/Inputs/CustomDatePicker";

// ** API
import { RequestsContext } from "src/providers/RequestsContext";
import { ControlContext } from "src/providers/ControlContext";
import { CommonContext } from "src/providers/CommonContext";
import { SystemRepository } from "src/repositories/SystemRepository";
import CustomLookup from "src/components/Inputs/CustomLookup";

// ** Resources
import { ResourceIds } from "src/resources/ResourceIds";
import { DataSets } from 'src/resources/DataSets'
import { CurrencyTradingSettingsRepository } from "src/repositories/CurrencyTradingSettingsRepository";
import { position } from "stylis";
import FieldSet from "src/components/Shared/FieldSet";
import { KVSRepository } from "src/repositories/KVSRepository";
import { RTCLRepository } from "src/repositories/RTCLRepository";
import AddressTab from "src/components/Shared/AddressTab";
import { CTIDRepository } from "src/repositories/CTIDRepository";
import { RemittanceSettingsRepository } from "src/repositories/RemittanceRepository";
import { CurrencyTradingClientRepository } from "src/repositories/CurrencyTradingClientRepository";

const Defaults = () => {
  const { getRequest, postRequest } = useContext(RequestsContext);
  const { getLabels, getAccess } = useContext(ControlContext);
  const { getAllKvsByDataset } = useContext(CommonContext)

  //control
  const [labels, setLabels] = useState(null);
  const [access, setAccess] = useState(null);
  const [types, setTypes] = useState([]);
  const [countryStore, setCountryStore] = useState([]);
  const [cityStore, setCityStore] = useState([]);
  const [professionStore, setProfessionStore] = useState([]);
  const [salaryRangeStore, setSalaryRangeStore] = useState([]);
  const [incomeOfSourceStore, setIncomeOfSourceStore] = useState([]);
  const [smsLanguageStore, setSMSLanguageStore] = useState([]);
  const [civilStatusStore, setCivilStatusStore] = useState([]);
  const [genderStore, setGenderStore] = useState([]);
  const [stateStore, setStateStore] = useState([]);
  const [educationStore, setEducationStore] = useState([]);
  const [idTypeStore, setIdTypeStore] = useState([]);

  const [titleStore, setTitleStore] = useState([]);

  //stores

  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!access) getAccess(ResourceIds.ClientMaster, setAccess);
    else {
      if (access.record.maxAccess > 0) {
        getLabels(ResourceIds.ClientMaster, setLabels);
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

      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" });
      }
    }

    // getDataResult()
  }, [access]);

  const _labels = {
    reference: labels && labels.find((item) => item.key === 1).value,
    dateBirth: labels && labels.find((item) => item.key === 2).value,
    isResident: labels && labels.find((item) => item.key === 34).value,
    number: labels && labels.find((item) => item.key === 5).value,
    type: labels && labels.find((item) => item.key === 6).value,
    expiryDate: labels && labels.find((item) => item.key === 7).value,
    issusDate: labels && labels.find((item) => item.key === 8).value,
    country: labels && labels.find((item) => item.key === 9).value,
    city: labels && labels.find((item) => item.key === 10).value,
    cityDistrict: labels && labels.find((item) => item.key === 55).value,
    first: labels && labels.find((item) => item.key === 11).value,
    last: labels && labels.find((item) => item.key === 12).value,
    middle: labels && labels.find((item) => item.key === 13).value,
    family: labels && labels.find((item) => item.key === 14).value,
    fl_first: labels && labels.find((item) => item.key === 62).value,
    fl_last: labels && labels.find((item) => item.key === 63).value,
    fl_middle: labels && labels.find((item) => item.key === 64).value,
    fl_family: labels && labels.find((item) => item.key === 65).value,
    nationality: labels && labels.find((item) => item.key === 15).value,
    profession: labels && labels.find((item) => item.key === 16).value,
    cellPhone: labels && labels.find((item) => item.key === 17).value,
    status: labels && labels.find((item) => item.key === 18).value,
    oldReference: labels && labels.find((item) => item.key === 19).value,
    salaryRange: labels && labels.find((item) => item.key === 22).value,
    riskLevel: labels && labels.find((item) => item.key === 23).value,
    smsLanguage: labels && labels.find((item) => item.key === 24).value,
    incomeSource: labels && labels.find((item) => item.key === 25).value,
    civilStatus: labels && labels.find((item) => item.key === 26).value,
    educationLevel: labels && labels.find((item) => item.key === 27).value,
    gender: labels && labels.find((item) => item.key === 28).value,
    title: labels && labels.find((item) => item.key === 29).value,
    mobileVerified: labels && labels.find((item) => item.key === 35).value,

    otpVerified: labels && labels.find((item) => item.key === 36).value,
    coveredFace: labels && labels.find((item) => item.key === 37).value,
    isEmployed: labels && labels.find((item) => item.key === 38).value,

    diplomat: labels && labels.find((item) => item.key === 39).value,
    isDiplomat: labels && labels.find((item) => item.key === 40).value,
    isDiplomatRelative: labels && labels.find((item) => item.key === 41).value,
    relativeDiplomateInfo:
      labels && labels.find((item) => item.key === 42).value,

    id: labels && labels.find((item) => item.key === 30).value,
    name: labels && labels.find((item) => item.key === 31).value,
    whatsapp: labels && labels.find((item) => item.key === 20).value,
    sponsor: labels && labels.find((item) => item.key === 21).value,
    address: labels && labels.find((item) => item.key === 43).value,
    customerInformation: labels && labels.find((item) => item.key === 44).value,
    workAddress:labels && labels.find((item) => item.key === 45).value,
    street1:labels && labels.find((item) => item.key === 56).value,
    street2: labels && labels.find((item) => item.key === 57).value,
    email: labels && labels.find((item) => item.key === 48).value,
    email2: labels && labels.find((item) => item.key === 49).value,
    phone: labels && labels.find((item) => item.key === 46).value,
    phone2: labels && labels.find((item) => item.key === 47).value,
    phone3: labels && labels.find((item) => item.key === 50).value,
    postalCode: labels && labels.find((item) => item.key === 54).value,
    bldgNo :  labels && labels.find((item) => item.key === 51).value,
    unitNo:  labels && labels.find((item) => item.key === 52).value,
    subNo :  labels && labels.find((item) => item.key === 53).value,
  };

  const clientIndividualFormValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true, // Trigger validation on change
    validateOnBlur: true,


     initialValues: {
      reference: null,
      isResident: false,
      number: null,
      numberEncrypt: null,
      numberVerified: null,
      numberVerifiedEncrypt: null,
      type: null,
      expiryDate: null,
      issusDate: null,
      countryId: null,
      cityId: null,
      whatsappNo: null,
      sponsorName: null,
      firstName: null,
      lastName: null,
      middleName: null,
      familyName: null,
      fl_firstName: null,
      fl_lastName: null,
      fl_middleName: null,
      fl_familyName: null,
      birthDate: null,
      nationalityId: null,
      nationality: null,
      profession: null,
      professionId: null,
      cellPhone: null,
      cellPhoneRepeat: null,

      status: null,
      idtId: null,
      oldReference: null,
      salaryRange: null,
      salaryRangeId: null,
      riskLevel: null,
      smsLanguage: null,
      smsLanguageId: null,
      incomeSourceId: null,
      incomeSource: null,
      civilStatus: null,
      civilStatusId: null,
      educationLevel: null,
      educationLevelName: null,
      gender: null,
      genderId: null,
      title: null,
      titleId: null,
      mobileVerified: false,
      otpVerified: false,
      coveredFace: false,
      isEmployee: false,
      isDiplomat: false,
      isRelativeDiplomate: false,
      relativeDiplomateInfo: null,
      name: null,
      countryId: null,
      stateId: null,
      cityId: null,
      cityName: null,
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
      bldgNo: null,
      unitNo: null,
      subNo: null

    },

    validationSchema: yup.object({
      reference: yup.string().required("This field is required"),
      isResident: yup.string().required("This field is required"),
      birthDate: yup.string().required("This field is required"),
      idtId: yup.string().required("This field is required"),
      number:  yup.string().required("This field is required"),
      numberRepeat : yup.string().required('Repeat Password is required')
      .oneOf([yup.ref('number'), null], 'Number must match'),
      expiryDate: yup.string().required("This field is required"),
      countryId: yup.string().required("This field is required"),
      cityId: yup.string().required("This field is required"),
      firstName: yup.string().required("This field is required"),
      lastName: yup.string().required("This field is required"),
      nationalityId: yup.string().required("This field is required"),
      professionId: yup.string().required("This field is required"),
      cellPhone: yup.string().required("This field is required"),
      cellPhoneRepeat : yup.string().required('Repeat Password is required')
      .oneOf([yup.ref('cellPhone'), null], 'Cell phone must match'),

      // status: yup.string().required("This field is required"),
      salaryRangeId: yup.string().required("This field is required"),
      smsLanguage: yup.string().required("This field is required"),
      incomeSourceId: yup.string().required("This field is required"),

      // mobileVerified: yup.string().required("This field is required"),
      // otpVerified: yup.string().required("This field is required"),
      // coveredFace: yup.string().required("This field is required"),
      // isEmployee: yup.string().required("This field is required"),
      isDiplomat: yup.string().required("This field is required"),
      isRelativeDiplomate: yup.string().required("This field is required"),
      relativeDiplomateInfo: yup.string().required("This field is required"),

      // name:  yup.string().required('This field is required'),
      countryId:  yup.string().required('This field is required'),
      cityId:  yup.string().required('This field is required'),
      street1:  yup.string().required('This field is required'),
      phone: yup.string().required('This field is required')
    }),
    onSubmit: (values) => {
      console.log("values" + values);
      postRtDefault(values);
    },
  });

  const WorkAddressValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      name: null,
      countryId: null,
      stateId: null,
      cityId: null,
      cityName: null,
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
      bldgNo: null,
      unitNo: null,
      subNo: null
    },
    validationSchema: yup.object({
      // name:  yup.string().required('This field is required'),
      // countryId:  yup.string().required('This field is required'),
      // cityId:  yup.string().required('This field is required'),
      // street1:  yup.string().required('This field is required'),
      // phone: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log(values);

      // clientIndividualFormValidation.handleSubmit();

        // postAgentBranch(values)

    }
  })

  console.log(clientIndividualFormValidation);

  const postRtDefault = (obj) => {
    console.log("obj", obj);

    //CTCL



    const obj1 = {
      category: 1,
      reference: obj.reference,
      name: obj.firstName,
      flName: obj.fl_firstName,
      nationalityId: obj.nationalityId,
      status: obj.status,
      addressId: null,
      plantId: 3,
      cellPhone: obj.cellPhone,
      createdDate:  obj.expiryDate,
      expiryDate: obj.expiryDate,
      otp: obj.otpVerified,
      plantName: obj.plantName,
      nationalityName: obj.nationalityName,
      status:1, //obj.statusName,
      categoryName: obj.categoryName

    };


    //CCTD
    const obj2 = {
      idNo : "1",

      // clientID: null,
      idCountryId: obj.countryId,
      idtId: obj.idtId ,  //5
      idExpiryDate: obj.expiryDate,
      issusDate: obj.issusDate,
      idCity: obj.cityId,
      isDiplomatic: obj.isDiplomat,

    };



    //CTCLI
    const obj3 = {
      // clientID: null,
      firstName: obj.firstName,
      lastName: obj.lastName,
      middleName: obj.middleName,
      familyName: obj.familyName,
      fl_firstName: obj.fl_firstName,
      fl_lastName: obj.fl_lastName,
      fl_middleName: obj.fl_middleName,
      fl_familyName: obj.fl_familyName,
      birthDate: obj.birthDate,
      isResident: obj.isResident,

    };


    const obj4 = {
      incomeSourceId: obj.incomeSourceId,
      salaryRangeId: obj.salaryRangeId,
      riskLevel: obj.riskLevel,
      smsLanguage: obj.smsLanguage,
      sponsorName: obj.sponsorName,
      whatsAppNo: obj.whatsappNo,
      gender: obj.gender,
      title: obj.title,
      civilStatus: obj.civilStatus,
      mobileVerificationStatus: 1, //obj.mobileVerified,
      educationLevel: obj.educationLevel,
      isDiplomatic: obj.isDiplomat,
      isRelativeDiplomate: obj.isRelativeDiplomate,
      relativeDiplomateInfo: obj.relativeDiplomateInfo,
      OTPVerified: obj.OTPVerified,
      coveredFace: obj.coveredFace,
      isEmployee: obj.isEmployee,

      // status: obj.status,

      // isVerified: true,
      // reference: obj.reference,
      professionId:obj.professionId,
      idNo : "1",
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
      clientMaster: obj1, //CTCL
      clientID: obj2, //CTID
      ClientIndividual: obj3, //CTCLI
      clientRemittance: obj4,
      address: obj5,
      workAddress: obj6

    };

    console.log(data);
    postRequest({
      extension: RTCLRepository.CtClientIndividual.set2,
      record: JSON.stringify(data), // JSON.stringify({  sysDefaults  : data })
    })
      .then((res) => {
        if (res) toast.success("Record Successfully");
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };

  const handleSubmit = () => {
    clientIndividualFormValidation.handleSubmit();

    WorkAddressValidation.handleSubmit();

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

  const fillStateStore = countryId => {
    var parameters = `_countryId=${countryId}`
    getRequest({
      extension: SystemRepository.State.qry,
      parameters: parameters
    })
      .then(res => {
        setStateStore(res.list)
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
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}&_countryId=${clientIndividualFormValidation.values.countryId}&_stateId=0`;
    getRequest({
      extension: SystemRepository.City.snapshot,
      parameters: parameters,
    })
      .then((res) => {
        console.log(res.list);
        setCityStore(res.list);
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
    var parameters = `_filter=_&profession=36116`;
    getRequest({
      extension: RemittanceSettingsRepository.Profession.qry,
      parameters: parameters,
    })
      .then((res) => {
        setProfessionStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };

  const fillSalaryRangeStore = () => {
    var parameters = `_filter=_&salaryRange=36118`;
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
    var parameters = `_filter=_&sourceOfIncome=36117`;
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
      _dataset: DataSets.Title,
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


  const encryptFirstFourDigits = (e) => {
    const input = e.target.value
    const showLength = Math.max(0, input.length - 4);

    // Check if input has at least four digits

  const maskedValue =
    '*'.repeat(showLength) + input.substring(showLength);
     clientIndividualFormValidation.setFieldValue("numberEncrypt", maskedValue)

    //  clientIndividualFormValidation.setFieldValue("numberEncrypt", input)


  };

  const handleCopy = (event) => {
    event.preventDefault();
  };




  const encryptFirstFourDigitsRepeat = (e) => {
    const input = e.target.value
    const showLength = Math.max(0, input.length - 4);

    // Check if input has at least four digits

  const maskedValue =
    '*'.repeat(showLength) + input.substring(showLength);
     clientIndividualFormValidation.setFieldValue("numberRepeatEncrypt", maskedValue)

    //  clientIndividualFormValidation.setFieldValue("numberRepeat", input)


  };


  return (
    <>
      <Grid container xs={12} spacing={2} sx={{ padding: "40px" }}>
        <Grid item xs={6} sx={{ padding: "40px" }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <CustomTextField
                name="reference"
                label={_labels.reference}
                value={clientIndividualFormValidation.values?.reference}
                required
                onChange={clientIndividualFormValidation.handleChange}
                maxLength="10"
                onClear={() =>
                  clientIndividualFormValidation.setFieldValue("reference", "")
                }
                error={
                  clientIndividualFormValidation.touched.reference &&
                  Boolean(clientIndividualFormValidation.errors.reference)
                }
                helperText={
                  clientIndividualFormValidation.touched.reference &&
                  clientIndividualFormValidation.errors.reference
                }
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isResident"
                    checked={clientIndividualFormValidation.values?.isResident}
                    onChange={clientIndividualFormValidation.handleChange}
                  />
                }
                label={_labels.isResident}
              />
            </Grid>
{/*
            <Grid item xs={12}>
              <CustomDatePicker
                name="birthDate"
                label={_labels.birthDate}
                value={clientIndividualFormValidation.values?.birthDate}
                required={true}
                onChange={clientIndividualFormValidation.handleChange}
                onClear={() =>
                  clientIndividualFormValidation.setFieldValue("birthDate", "")
                }
                error={
                  clientIndividualFormValidation.touched.birthDate &&
                  Boolean(clientIndividualFormValidation.errors.birthDate)
                }
                helperText={
                  clientIndividualFormValidation.touched.birthDate &&
                  clientIndividualFormValidation.errors.birthDate
                }
              />
            </Grid> */}

            <Grid container xs={12}></Grid>
            <Grid item xs={12}>
              <FieldSet title={_labels.id}>
              <Grid item xs={12}>
                  <CustomComboBox
                    name="idtId"
                    label={_labels.type}
                    valueField="recordId"
                    displayField="name"
                    store={idTypeStore}
                    value={
                      idTypeStore.filter(
                        (item) =>
                          item.recordId ===
                          clientIndividualFormValidation.values.idtId,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {
                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "idtId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "typeName",
                        newValue?.name,
                      );}else{

                        clientIndividualFormValidation.setFieldValue(
                          "idtId",
                          '',
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "typeName",
                          '',
                        );

                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.idtId &&
                      Boolean(clientIndividualFormValidation.errors.idtId)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.idtId &&
                      clientIndividualFormValidation.errors.idtId
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name="number"
                    label={_labels.number}
                    value={clientIndividualFormValidation.values?.numberEncrypt}
                    required
                    onChange={ (e) =>{ clientIndividualFormValidation.handleChange(e) , encryptFirstFourDigits(e)  }}
                    onCopy={handleCopy}
                    onPaste={handleCopy}

                    // maxLength="10"
                    onClear={() =>{
                      clientIndividualFormValidation.setFieldValue("number", "")
                      clientIndividualFormValidation.setFieldValue("numberEncrypt", "")}

                    }
                    error={
                      clientIndividualFormValidation.touched.number &&
                      Boolean(clientIndividualFormValidation.errors.number)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.number &&
                      clientIndividualFormValidation.errors.number
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name="numberRepeat"
                    label={_labels.number}
                    value={clientIndividualFormValidation.values?.numberRepeatEncrypt}
                    required
                    onChange={ (e) =>{ clientIndividualFormValidation.handleChange(e) , encryptFirstFourDigitsRepeat(e)  }}
                    onBlur={clientIndividualFormValidation.handleBlur}
                    onCopy={handleCopy}
                    onPaste={handleCopy}

                    // maxLength="10"
                    onClear={() =>{
                      clientIndividualFormValidation.setFieldValue("numberRepeat", "")
                      clientIndividualFormValidation.setFieldValue("numberRepeatEncrypt", "")}

                    }
                    error={
                      clientIndividualFormValidation.touched.numberRepeat &&
                      Boolean(clientIndividualFormValidation.errors.numberRepeat)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.numberRepeat &&
                      clientIndividualFormValidation.errors.numberRepeat
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name="expiryDate"
                    label={_labels.expiryDate}
                    value={clientIndividualFormValidation.values?.expiryDate}
                    required={true}
                    onChange={clientIndividualFormValidation.setFieldValue}
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "expiryDate",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.expiryDate &&
                      Boolean(clientIndividualFormValidation.errors.expiryDate)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.expiryDate &&
                      clientIndividualFormValidation.errors.expiryDate
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomDatePicker
                    name="issusDate"
                    label={_labels.issusDate}
                    value={clientIndividualFormValidation.values?.issusDate}

                    // required={true}
                    onChange={clientIndividualFormValidation.handleChange}
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "issusDate",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.issusDate &&
                      Boolean(clientIndividualFormValidation.errors.issusDate)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.issusDate &&
                      clientIndividualFormValidation.errors.issusDate
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomComboBox
                    name="countryId"
                    label={_labels.country}
                    valueField="recordId"
                    displayField={['reference','name','flName']}
                store={countryStore}
                columnsInDropDown= {[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language Name' }
                ]}
                    value={
                      countryStore.filter(
                        (item) =>
                          item.recordId ===
                          clientIndividualFormValidation.values.countryId,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {
                      setCityStore([])

                      if(newValue){


                      clientIndividualFormValidation.setFieldValue(
                        "countryId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "countryName",
                        newValue?.name,
                      );}else{
                        clientIndividualFormValidation.setFieldValue(
                          "countryId",
                          ''
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "countryName",
                          ''
                        );

                        clientIndividualFormValidation.setFieldValue(
                          "cityId",
                          null
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "cityName",
                          null
                        );


                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.countryId &&
                      Boolean(clientIndividualFormValidation.errors.countryId)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.countryId &&
                      clientIndividualFormValidation.errors.countryId
                    }
                  />
                </Grid>

                <Grid item xs={12}>


                  <CustomLookup
                    name="cityId"
                    label={_labels.city}
                    value={clientIndividualFormValidation.values.cityId}
                    required
                    valueField="name"
                    store={cityStore}
                    firstValue={clientIndividualFormValidation.values.cityName}

                    // secondValue={clientIndividualFormValidation.values.cityName}

                    secondDisplayField={false}

                    //  secondDisplayField={false}
                    setStore={setCityStore}
                    onLookup={lookupCity}


                    onChange={(event, newValue) => {
                      if (newValue) {
                        clientIndividualFormValidation.setFieldValue(
                          "cityId",
                          newValue?.recordId,
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "cityName",
                          newValue?.name,
                        );
                      } else {
                        clientIndividualFormValidation.setFieldValue(
                          "cityId",
                          null,
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "cityName",
                          null,
                        );
                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.cityId &&
                      Boolean(clientIndividualFormValidation.errors.cityId)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.cityId &&
                      clientIndividualFormValidation.errors.cityId
                    }
                  />
                </Grid>
              </FieldSet>
              <Grid item xs={12} sx={{marginTop:'20px'}}>
                {/* <AddressTab labels={_labels} addressValidation={clientIndividualFormValidation} countryStore={countryStore} cityStore={cityStore} row={1} orderedFields={['cityId' , 'street1' , 'street2', 'email2', 'phone', 'empty ' , 'phone2', 'empty'  ,'phone3']}/> */}
                <FieldSet title={_labels.address}>
               <AddressTab labels={_labels} addressValidation={clientIndividualFormValidation} countryStore={countryStore} cityStore={cityStore} lookupCity={lookupCity} stateStore={stateStore}  fillStateStore={fillStateStore}/>
               </FieldSet>
                {/* <Grid item xs={12}>
                  <CustomTextField
                    name="whatsappNo"
                    label={_labels.whatsapp}
                    value={clientIndividualFormValidation.values?.whatsappNo}
                    required
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "whatsappNo",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.whatsappNo &&
                      Boolean(clientIndividualFormValidation.errors.whatsappNo)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.whatsappNo &&
                      clientIndividualFormValidation.errors.whatsappNo
                    }
                  />
                </Grid> */}

<Grid container spacing={2} sx={{ marginTop: "20px" }}>
              <Grid container xs={12} spacing={2} >
                <Grid item xs={12}>
                  <CustomComboBox
                    name="salaryRangeId"
                    label={_labels.salaryRange}
                    valueField="recordId"
                    displayField={["min", "max"]}
                    columnsInDropDown={[
                      { key: "min", value: "min" },
                      { key: "max", value: "max" },
                    ]}
                    store={salaryRangeStore}
                    value={
                      salaryRangeStore.filter(
                        (item) =>
                          item.recordId ===
                          clientIndividualFormValidation.values.salaryRangeId,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "salaryRangeId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "salaryRange",
                        newValue?.name,
                      );
                    }else{
                      clientIndividualFormValidation.setFieldValue(
                        "salaryRangeId",
                        '',
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "salaryRange",
                        '',
                      );

                    }
                    }}
                    error={
                      clientIndividualFormValidation.touched.salaryRangeId &&
                      Boolean(
                        clientIndividualFormValidation.errors.salaryRangeId,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.salaryRangeId &&
                      clientIndividualFormValidation.errors.salaryRangeId
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomComboBox
                    name="riskLevel"
                    label={_labels.riskLevel}
                    readOnly //disabled
                    valueField="recordId"
                    displayField="name"
                    store={countryStore}
                    value={
                      countryStore.filter(
                        (item) =>
                          item.recordId ===
                          clientIndividualFormValidation.values.riskLevelId,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "riskLevelId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "riskLevel",
                        newValue?.name,
                      );}else{

                        clientIndividualFormValidation.setFieldValue(
                          "riskLevelId",
                          null,
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "riskLevel",
                          null,
                        );

                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.riskLevelId &&
                      Boolean(clientIndividualFormValidation.errors.riskLevelId)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.riskLevelId &&
                      clientIndividualFormValidation.errors.riskLevelId
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomComboBox
                    name="smsLanguage"
                    label={_labels.smsLanguage}
                    valueField="key"
                    displayField="value"
                    store={smsLanguageStore}
                    value={
                      smsLanguageStore.filter(
                        (item) =>
                          item.key ===
                          clientIndividualFormValidation.values.smsLanguage,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "smsLanguage",
                        newValue?.key,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "smsLanguageName",
                        newValue?.value,
                      );
                    }else{

                        clientIndividualFormValidation.setFieldValue(
                          "smsLanguage",
                          '',
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "smsLanguageName",
                          '',
                        );
                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.smsLanguage &&
                      Boolean(
                        clientIndividualFormValidation.errors.smsLanguage,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.smsLanguage &&
                      clientIndividualFormValidation.errors.smsLanguage
                    }
                  />
                </Grid>


              </Grid>
              <Grid container xs={12} spacing={2}  sx={{marginTop:'5px'}}>
                <Grid item xs={12}>
                  <CustomComboBox
                    name="civilStatus"
                    label={_labels.civilStatus}
                    valueField="key"
                    displayField="value"
                    store={civilStatusStore}
                    value={clientIndividualFormValidation.values?.civilStatusName}
                    onChange={(event, newValue) => {

                      if(newValue){
                        clientIndividualFormValidation.setFieldValue(
                          "civilStatus",
                          newValue?.key,
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "civilStatusName",
                          newValue?.value,
                        );
                      }else{
                      clientIndividualFormValidation.setFieldValue(
                        "civilStatus",
                        newValue?.key,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "civilStatusName",
                        newValue?.value,
                      );

                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.civilStatus &&
                      Boolean(
                        clientIndividualFormValidation.errors.civilStatus,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.civilStatus &&
                      clientIndividualFormValidation.errors.civilStatus
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                <CustomTextField
                  name="statusName"
                  label={_labels.status}
                  value={clientIndividualFormValidation.values?.statusName}
                  required
                  type="number"
                  onChange={clientIndividualFormValidation.handleChange}
                  maxLength="10"
                  onClear={() =>
                    clientIndividualFormValidation.setFieldValue("statusName", "")
                  }
                  readonly

                  error={
                    clientIndividualFormValidation.touched.statusName &&
                    Boolean(clientIndividualFormValidation.errors.statusName)
                  }
                  helperText={
                    clientIndividualFormValidation.touched.statusName &&
                    clientIndividualFormValidation.errors.statusName
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  name="oldReference"
                  label={_labels.oldReference}
                  value={clientIndividualFormValidation.values?.oldReference}

                  onChange={clientIndividualFormValidation.handleChange}
                  maxLength="10"
                  onClear={() =>
                    clientIndividualFormValidation.setFieldValue(
                      "oldReference",
                      "",
                    )
                  }
                  error={
                    clientIndividualFormValidation.touched.oldReference &&
                    Boolean(clientIndividualFormValidation.errors.oldReference)
                  }
                  helperText={
                    clientIndividualFormValidation.touched.oldReference &&
                    clientIndividualFormValidation.errors.oldReference
                  }
                />
              </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    name="whatsappNo"
                    label={_labels.whatsapp}
                    value={clientIndividualFormValidation.values?.whatsappNo}

                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "whatsappNo",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.whatsappNo &&
                      Boolean(clientIndividualFormValidation.errors.whatsappNo)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.whatsappNo &&
                      clientIndividualFormValidation.errors.whatsappNo
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomComboBox
                    name="title"
                    label={_labels.title}
                    valueField="key"
                    displayField="value"
                    store={titleStore}
                    value={clientIndividualFormValidation.values?.title}
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "titleId",
                        newValue?.key,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "titleId",
                        newValue?.value,
                      );
                      }else{
                        clientIndividualFormValidation.setFieldValue(
                          "titleId",
                          null,
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "title",
                          null,
                        );
                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.title &&
                      Boolean(clientIndividualFormValidation.errors.title )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.title &&
                      clientIndividualFormValidation.errors.title
                    }
                  />
                </Grid>
              </Grid>
              <Grid container xs={6} spacing={2} sx={{ padding: "5px" }}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="mobileVerified"
                        disabled={true}

                        // checked={clientIndividualFormValidation.values?.isInactive}
                        onChange={clientIndividualFormValidation.handleChange}
                      />
                    }
                    label={_labels?.mobileVerified}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="OTPVerified"
                        disabled={true}
                        checked={
                          clientIndividualFormValidation.values?.OTPVerified
                        }
                        onChange={clientIndividualFormValidation.handleChange}
                      />
                    }
                    label={_labels?.otpVerified}
                  />
                </Grid>{}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={clientIndividualFormValidation.values.genderId ===2 ? false : true}

                        name="coveredFace"
                        checked={
                          clientIndividualFormValidation.values?.coveredFace
                        }
                        onChange={clientIndividualFormValidation.handleChange}
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
                        checked={
                          clientIndividualFormValidation.values?.isEmployee
                        }
                        onChange={clientIndividualFormValidation.handleChange}
                      />
                    }
                    label={_labels?.isEmployed}
                  />
                </Grid>
              </Grid>

              <Grid container xs={6} spacing={2} sx={{ paddingTop: "15px" }}>
                <Grid container xs={12}>
                  <FieldSet title={_labels.diplomat}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="isDiplomatic"
                            checked={
                              clientIndividualFormValidation.values?.isInactive
                            }
                            onChange={
                              clientIndividualFormValidation.handleChange
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
                            name="isRelativeDiplomate"
                            checked={
                              clientIndividualFormValidation.values?.isInactive
                            }
                            onChange={
                              clientIndividualFormValidation.handleChange
                            }
                          />
                        }
                        label={_labels?.isDiplomatRelative}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name="relativeDiplomateInfo"
                        label={_labels.relativeDiplomateInfo}
                        value={
                          clientIndividualFormValidation.values
                            ?.relativeDiplomateInfo
                        }
                        onChange={clientIndividualFormValidation.handleChange}
                        maxLength="10"
                        onClear={() =>
                          clientIndividualFormValidation.setFieldValue(
                            "relativeDiplomateInfo",
                            "",
                          )
                        }
                        error={
                          clientIndividualFormValidation.touched
                            .relativeDiplomateInfo &&
                          Boolean(
                            clientIndividualFormValidation.errors
                              .relativeDiplomateInfo,
                          )
                        }
                        helperText={
                          clientIndividualFormValidation.touched
                            .relativeDiplomateInfo &&
                          clientIndividualFormValidation.errors
                            .relativeDiplomateInfo
                        }
                      />
                    </Grid>
                  </FieldSet>
                </Grid>
              </Grid>
            </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={6}>
          <Grid container xs={12} spacing={2}>

            <Grid item xs={12} >
              <FieldSet title={_labels.customerInformation}>
              <Grid item xs={6}>
                <CustomTextField
                  name="cellPhone"
                  label={_labels.cellPhone}
                  value={clientIndividualFormValidation.values?.cellPhone}
                  required
                  onChange={clientIndividualFormValidation.handleChange}
                  maxLength="10"
                  onCopy={handleCopy}
                  onPaste={handleCopy}
                  onClear={() =>
                    clientIndividualFormValidation.setFieldValue(
                      "cellPhone",
                      "",
                    )
                  }
                  error={
                    clientIndividualFormValidation.touched.cellPhone &&
                    Boolean(clientIndividualFormValidation.errors.cellPhone)
                  }
                  helperText={
                    clientIndividualFormValidation.touched.cellPhone &&
                    clientIndividualFormValidation.errors.cellPhone
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <CustomTextField
                  name="cellPhoneRepeat"
                  label={_labels.cellPhone}
                  value={clientIndividualFormValidation.values?.cellPhoneRepeat}
                  required
                  onChange={clientIndividualFormValidation.handleChange}
                  onCopy={handleCopy}
                  onPaste={handleCopy}
                  onClear={() =>
                    clientIndividualFormValidation.setFieldValue(
                      "cellPhoneRepeat",
                      "",
                    )
                  }
                  error={
                    clientIndividualFormValidation.touched.cellPhoneRepeat &&
                    Boolean(clientIndividualFormValidation.errors.cellPhoneRepeat)
                  }
                  onBlur={clientIndividualFormValidation.handleBlur}

                  helperText={
                    clientIndividualFormValidation.touched.cellPhoneRepeat &&
                    clientIndividualFormValidation.errors.cellPhoneRepeat
                  }
                />
              </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="firstName"
                    label={_labels.first}
                    value={clientIndividualFormValidation.values?.firstName}
                    required
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "firstName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.firstName &&
                      Boolean(clientIndividualFormValidation.errors.firstName)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.firstName &&
                      clientIndividualFormValidation.errors.firstName
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="middleName"
                    label={_labels.middle}
                    value={clientIndividualFormValidation.values?.middleName}
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "middleName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.middleName &&
                      Boolean(clientIndividualFormValidation.errors.middleName)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.middleName &&
                      clientIndividualFormValidation.errors.middleName
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="lastName"
                    label={_labels.last}
                    value={clientIndividualFormValidation.values?.lastName}
                    required
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "lastName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.lastName &&
                      Boolean(clientIndividualFormValidation.errors.lastName)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.lastName &&
                      clientIndividualFormValidation.errors.lastName
                    }
                  />
                </Grid>


                <Grid item xs={3}>
                  <CustomTextField
                    name="familyName"
                    label={_labels.family}
                    value={clientIndividualFormValidation.values?.familyName}
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "familyName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.familyName &&
                      Boolean(clientIndividualFormValidation.errors.familyName)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.familyName &&
                      clientIndividualFormValidation.errors.familyName
                    }
                  />
                </Grid>






                <Grid item xs={3}>
                  <CustomTextField
                    name="fl_familyName"
                    label={_labels.fl_family}
                    value={clientIndividualFormValidation.values?.fl_familyName}
                    onChange={clientIndividualFormValidation.handleChange}
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "fl_familyName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.fl_familyName &&
                      Boolean(
                        clientIndividualFormValidation.errors.fl_familyName,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.fl_familyName &&
                      clientIndividualFormValidation.errors.fl_familyName
                    }
                  />
                </Grid>


                <Grid item xs={3}>
                <CustomTextField
                    name="fl_lastName"
                    label={_labels.fl_last}
                    value={clientIndividualFormValidation.values?.fl_lastName}
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "fl_lastName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.fl_lastName &&
                      Boolean(clientIndividualFormValidation.errors.fl_lastName)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.fl_lastName &&
                      clientIndividualFormValidation.errors.fl_lastName
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="fl_middleName"
                    label={_labels.fl_middle}
                    value={clientIndividualFormValidation.values?.fl_middleName}
                    onChange={clientIndividualFormValidation.handleChange}
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "fl_familyName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.fl_middleName &&
                      Boolean(
                        clientIndividualFormValidation.errors.fl_middleName,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.fl_middleName &&
                      clientIndividualFormValidation.errors.fl_middleName
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="fl_firstName"
                    label={_labels.fl_first}
                    value={clientIndividualFormValidation.values?.fl_firstName}
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "fl_firstName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.fl_firstName &&
                      Boolean(
                        clientIndividualFormValidation.errors.fl_firstName,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.fl_firstName &&
                      clientIndividualFormValidation.errors.fl_firstName
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                <CustomComboBox
                  name="nationalityId"
                  label={_labels.nationality}
                  valueField="recordId"
                  displayField="name"
                  store={countryStore}
                  value={
                    countryStore.filter(
                      (item) =>
                        item.recordId ===
                        clientIndividualFormValidation.values.nationalityId,
                    )[0]
                  }
                  required
                  onChange={(event, newValue) => {

                    if(newValue){
                    clientIndividualFormValidation.setFieldValue(
                      "nationalityId",
                      newValue?.recordId,
                    );
                    clientIndividualFormValidation.setFieldValue(
                      "nationalityName",
                      newValue?.name,
                    );}else{

                      clientIndividualFormValidation.setFieldValue(
                        "nationalityId",
                        ''
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "nationalityName",
                        '',
                      );


                    }
                  }}
                  error={
                    clientIndividualFormValidation.touched.nationalityId &&
                    Boolean(clientIndividualFormValidation.errors.nationalityId)
                  }
                  helperText={
                    clientIndividualFormValidation.touched.nationalityId &&
                    clientIndividualFormValidation.errors.nationalityId
                  }
                />
              </Grid>

            <Grid item xs={12}>
              <CustomDatePicker
                name="birthDate"
                label={_labels.birthDate}
                value={clientIndividualFormValidation.values?.birthDate}
                required={true}
                onChange={clientIndividualFormValidation.setFieldValue}
                onClear={() =>
                  clientIndividualFormValidation.setFieldValue("birthDate", "")
                }
                error={
                  clientIndividualFormValidation.touched.birthDate &&
                  Boolean(clientIndividualFormValidation.errors.birthDate)
                }
                helperText={
                  clientIndividualFormValidation.touched.birthDate &&
                  clientIndividualFormValidation.errors.birthDate
                }
              />
            </Grid>
            <Grid item xs={12}>
                  <CustomComboBox
                    name="gender"
                    label={_labels.gender}
                    valueField="key"
                    displayField="value"
                    store={genderStore}
                    value={
                      genderStore.filter(
                        (item) =>
                          item.key ===
                          clientIndividualFormValidation.values.gender,
                      )[0]
                    }                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "genderId",
                        newValue?.key,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "gender",
                        newValue?.value,
                      );
                    }else{

                      clientIndividualFormValidation.setFieldValue(
                        "genderId",
                        '',
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "gender",
                        '',
                      );
                    }
                    }}
                    error={
                      clientIndividualFormValidation.touched.genderId &&
                      Boolean(clientIndividualFormValidation.errors.genderId)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.genderId &&
                      clientIndividualFormValidation.errors.genderId
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomComboBox
                    name="educationLevel"
                    label={_labels.educationLevel}
                    valueField="key"
                    displayField="value"
                    store={educationStore}

                    // value={
                    //   clientIndividualFormValidation.values?.educationLevel
                    // }

                    value={
                      educationStore.filter(
                        (item) =>
                          item.key ===
                          clientIndividualFormValidation.values.educationLevel,
                      )[0]
                    }
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "educationLevel",
                        newValue?.key,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "educationLevelName",
                        newValue?.Value,
                      );
                    }else{
                      clientIndividualFormValidation.setFieldValue(
                        "educationLevel",
                        null,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "educationLevelName",
                        null,
                      );

                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.educationLevel &&
                      Boolean(
                        clientIndividualFormValidation.errors.educationLevel,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.educationLevel &&
                      clientIndividualFormValidation.errors.educationLevel
                    }
                  />
                </Grid>
                {/* <Grid item xs={7}>
                  <CustomComboBox
                    name="category"
                    label={_labels.educationLevel}
                    valueField="recordId"
                    displayField="name"
                    store={countryStore}
                    value={
                      clientIndividualFormValidation.values?.educationLevelId
                    }
                    onChange={(event, newValue) => {
                      clientIndividualFormValidation.setFieldValue(
                        "educationLevelId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "educationLevel",
                        newValue?.name,
                      );
                    }}
                    error={
                      clientIndividualFormValidation.touched.educationLevelId &&
                      Boolean(
                        clientIndividualFormValidation.errors.educationLevelId,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.educationLevelId &&
                      clientIndividualFormValidation.errors.educationLevelId
                    }
                  />
                </Grid> */}
                <Grid item xs={12}>
                  <CustomComboBox
                    name="incomeSourceId"
                    label={_labels.incomeSource}
                    valueField="recordId"
                    displayField="name"
                    store={incomeOfSourceStore}
                    value={
                      incomeOfSourceStore.filter(
                        (item) =>
                          item.recordId ===
                          clientIndividualFormValidation.values.incomeSourceId,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {
                      clientIndividualFormValidation.setFieldValue(
                        "incomeSourceId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "incomeSource",
                        newValue?.name,
                      );
                    }}
                    error={
                      clientIndividualFormValidation.touched.incomeSourceId &&
                      Boolean(
                        clientIndividualFormValidation.errors.incomeSourceId,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.incomeSourceId &&
                      clientIndividualFormValidation.errors.incomeSourceId
                    }
                  />
                </Grid>


                <Grid item xs={12}>
                  <CustomTextField
                    name="salary"
                    label='salary'    //{_labels.whatsapp}
                    value={clientIndividualFormValidation.values?.whatsappNo}
                    required
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "whatsappNo",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.whatsappNo &&
                      Boolean(clientIndividualFormValidation.errors.whatsappNo)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.whatsappNo &&
                      clientIndividualFormValidation.errors.whatsappNo
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    name="sponsorName"
                    label={_labels.sponsor}
                    value={clientIndividualFormValidation.values?.sponsorName}
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "sponsorName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.sponsorName &&
                      Boolean(clientIndividualFormValidation.errors.sponsorName)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.sponsorName &&
                      clientIndividualFormValidation.errors.sponsorName
                    }
                  />
                </Grid>
                {/* <Grid item xs={12}>
                <CustomTextField
                  name="cellPhone"
                  label={_labels.cellPhone}
                  value={clientIndividualFormValidation.values?.cellPhone}
                  required
                  onChange={clientIndividualFormValidation.handleChange}
                  maxLength="10"
                  onClear={() =>
                    clientIndividualFormValidation.setFieldValue(
                      "cellPhone",
                      "",
                    )
                  }
                  error={
                    clientIndividualFormValidation.touched.cellPhone &&
                    Boolean(clientIndividualFormValidation.errors.cellPhone)
                  }
                  helperText={
                    clientIndividualFormValidation.touched.cellPhone &&
                    clientIndividualFormValidation.errors.cellPhone
                  }
                />
              </Grid> */}
              <Grid item xs={12} >
                <CustomComboBox
                  name="professionId"
                  label={_labels.profession}
                  valueField="recordId"
                  displayField="name"
                  store={professionStore}
                  value={
                    professionStore.filter(
                      (item) =>
                        item.recordId ===
                        clientIndividualFormValidation.values.professionId,
                    )[0]
                  }
                  required
                  onChange={(event, newValue) => {
                    clientIndividualFormValidation.setFieldValue(
                      "professionId",
                      newValue?.recordId,
                    );
                    clientIndividualFormValidation.setFieldValue(
                      "professionName",
                      newValue?.name,
                    );
                  }}
                  error={
                    clientIndividualFormValidation.touched.professionId &&
                    Boolean(clientIndividualFormValidation.errors.professionId)
                  }
                  helperText={
                    clientIndividualFormValidation.touched.professionId &&
                    clientIndividualFormValidation.errors.professionId
                  }
                />
              </Grid>
              </FieldSet>


     <Grid sx={{marginTop: '20px'}}>
              <FieldSet title={_labels.workAddress}>
              <AddressTab labels={_labels} addressValidation={WorkAddressValidation} countryStore={countryStore} cityStore={cityStore} lookupCity={lookupCity} stateStore={stateStore}  fillStateStore={fillStateStore}/>

               </FieldSet>
               </Grid>
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
          <WindowToolbar onSave={handleSubmit} />
        </Grid>
      </Grid>

      <ErrorWindow
        open={errorMessage}
        onClose={() => setErrorMessage(null)}
        message={errorMessage}
      />
    </>
  );
};

export default Defaults;
