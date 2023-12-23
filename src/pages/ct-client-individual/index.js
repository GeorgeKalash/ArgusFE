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
import Table from "src/components/Shared/Table";
import CustomComboBox from "src/components/Inputs/CustomComboBox";
import ErrorWindow from "src/components/Shared/ErrorWindow";
import Window from "src/components/Shared/Window";
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
import { CurrencyTradingSettingsRepository } from "src/repositories/CurrencyTradingSettingsRepository";
import { position } from "stylis";
import FieldSet from "src/components/Shared/FieldSet";
import { KVSRepository } from "src/repositories/KVSRepository";
import { RTCLRepository } from "src/repositories/RTCLRepository";
import AddressTab from "src/components/Shared/AddressTab";
import { CTIDRepository } from "src/repositories/CTIDRepository";

const Defaults = () => {
  const { getRequest, postRequest } = useContext(RequestsContext);
  const { getLabels, getAccess } = useContext(ControlContext);

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
    first: labels && labels.find((item) => item.key === 11).value,
    last: labels && labels.find((item) => item.key === 12).value,
    middle: labels && labels.find((item) => item.key === 13).value,
    family: labels && labels.find((item) => item.key === 14).value,
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
    address: "Address Details",
    workAddress: "Work Address Details",
    street1: 'street1',
    street2: 'street2',
    email: 'email1',
    email2: 'email2',
    phone: 'phone1',
    phone2: 'phone2',
    phone3: 'phone3',
    postalCode: 'postalCode'
  };

  const clientIndividualFormValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      reference: null,
      isResident: false,
      number: null,
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
      status: null,
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
      postalCode:null

    },
    validationSchema: yup.object({
      reference: yup.string().required("This field is required"),
      isResident: yup.string().required("This field is required"),
      birthDate: yup.string().required("This field is required"),

      expiryDate: yup.string().required("This field is required"),
      countryId: yup.string().required("This field is required"),
      cityId: yup.string().required("This field is required"),
      firstName: yup.string().required("This field is required"),
      lastName: yup.string().required("This field is required"),
      nationalityId: yup.string().required("This field is required"),
      professionId: yup.string().required("This field is required"),
      cellPhone: yup.string().required("This field is required"),
      status: yup.string().required("This field is required"),
      salaryRangeId: yup.string().required("This field is required"),
      smsLanguage: yup.string().required("This field is required"),
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
      postalCode:null
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
      createdDate:  obj.expiryDate,
      expiryDate: obj.expiryDate,


    };


    //CCTD
    const obj2 = {
      // clientID: null,
      idCountryId: obj.countryId,
      idCity: obj.cityId,
      idExpiryDate: obj.expiryDate,
      issusDate: obj.issusDate,
      idNo : "1",
      idtId: 5
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
      professionId: obj.professionId,
      cellPhone: obj.cellPhone,
      isResident: obj.isResident,
    };


    const obj4 = {
      incomeSourceId: obj.incomeSourceId,
      salaryRangeId: obj.salaryRangeId,
      riskLevel: obj.riskLevel,
      smsLanguage: obj.smsLanguage,
      sponsorName: obj.sponsorName,
      whatsappNo: obj.whatsappNo,
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
      status: obj.status,
      isVerified: true,
      reference: obj.reference,
      idNo : "1",
      wip: 1,
      releaseStatus: 1

      // date: obj.date,
    };



    const data = {
      clientMaster: obj1, //CTCL
      clientID: obj2, //CTID
      ClientIndividual: obj3, //CTCLI
      clientRemittance: obj4,

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

    // WorkAddressValidation.handleSubmit();

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
    var parameters = `_filter=_&countryId=` + cId;
    getRequest({
      extension: CurrencyTradingSettingsRepository.Profession.qry,
      parameters: parameters,
    })
      .then((res) => {
        setProfessionStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };

  const fillSalaryRangeStore = (cId) => {
    var parameters = `_filter=`;
    getRequest({
      extension: CurrencyTradingSettingsRepository.SalaryRange.qry,
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
    var parameters = `_filter=`; //add 'xml'.json and get _database values from there
    getRequest({
      extension: CurrencyTradingSettingsRepository.SourceOfIncome.qry,
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
    var parameters = "_database=150"; //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters,
    })
      .then((res) => {
        setEducationStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };

  const fillSMSLanguageStore = () => {
    var parameters = "_database=13"; //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters,
    })
      .then((res) => {
        setSMSLanguageStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };

  const fillGenderStore = () => {
    var parameters = "_database=9"; //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters,
    })
      .then((res) => {
        setGenderStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  };

  const fillCivilStatusStore = () => {
    var parameters = "_database=1019"; //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters,
    })
      .then((res) => {
        setCivilStatusStore(res.list);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
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
                    name="type"
                    label={_labels.type}
                    valueField="recordId"
                    displayField="name"
                    store={types}
                    value={clientIndividualFormValidation.values?.type}
                    required
                    onChange={(event, newValue) => {
                      clientIndividualFormValidation.setFieldValue(
                        "typeId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "typeName",
                        newValue?.name,
                      );
                    }}
                    error={
                      clientIndividualFormValidation.touched.typeId &&
                      Boolean(clientIndividualFormValidation.errors.typeId)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.typeId &&
                      clientIndividualFormValidation.errors.typeId
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name="number"
                    label={_labels.number}
                    value={clientIndividualFormValidation.values?.number}
                    required
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue("number", "")
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
                    displayField="name"
                    store={countryStore}
                    value={
                      countryStore.filter(
                        (item) =>
                          item.recordId ===
                          clientIndividualFormValidation.values.countryId,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {
                      clientIndividualFormValidation.setFieldValue(
                        "countryId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "countryName",
                        newValue?.name,
                      );
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
              <Grid container xs={12} sx={{ paddingTop: "10px" }} spacing={2}>
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
                      clientIndividualFormValidation.setFieldValue(
                        "salaryRangeId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "salaryRange",
                        newValue?.name,
                      );
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
                      clientIndividualFormValidation.setFieldValue(
                        "riskLevelId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "riskLevel",
                        newValue?.name,
                      );
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
                      clientIndividualFormValidation.setFieldValue(
                        "smsLanguage",
                        newValue?.key,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "smsLanguageName",
                        newValue?.value,
                      );
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
                    value={clientIndividualFormValidation.values?.civilStatus}
                    onChange={(event, newValue) => {
                      clientIndividualFormValidation.setFieldValue(
                        "civilStatus",
                        newValue?.key,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "civilStatusName",
                        newValue?.value,
                      );
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
                  name="status"
                  label={_labels.status}
                  value={clientIndividualFormValidation.values?.status}
                  required
                  type="number"
                  onChange={clientIndividualFormValidation.handleChange}
                  maxLength="10"
                  onClear={() =>
                    clientIndividualFormValidation.setFieldValue("status", "")
                  }
                  error={
                    clientIndividualFormValidation.touched.status &&
                    Boolean(clientIndividualFormValidation.errors.status)
                  }
                  helperText={
                    clientIndividualFormValidation.touched.status &&
                    clientIndividualFormValidation.errors.status
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  name="oldReference"
                  label={_labels.oldReference}
                  value={clientIndividualFormValidation.values?.oldReference}
                  required
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
                  <CustomComboBox
                    name="title"
                    label={_labels.title}
                    valueField="recordId"
                    displayField="name"
                    store={countryStore}
                    value={clientIndividualFormValidation.values?.titleId}
                    onChange={(event, newValue) => {
                      clientIndividualFormValidation.setFieldValue(
                        "titleId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "title",
                        newValue?.name,
                      );
                    }}
                    error={
                      clientIndividualFormValidation.touched.titleId &&
                      Boolean(clientIndividualFormValidation.errors.titleId)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.titleId &&
                      clientIndividualFormValidation.errors.titleId
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
                        checked={
                          clientIndividualFormValidation.values?.OTPVerified
                        }
                        onChange={clientIndividualFormValidation.handleChange}
                      />
                    }
                    label={_labels?.otpVerified}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
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
            <Grid item xs={12}>
              <FieldSet title={_labels.name}>
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
                    name="fl_firstName"
                    label={_labels.first}
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

                <Grid item xs={3}>
                  <CustomTextField
                    name="fl_lastName"
                    label={_labels.last}
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
                    label={_labels.middle}
                    value={clientIndividualFormValidation.values?.fl_middleName}
                    onChange={clientIndividualFormValidation.handleChange}
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "fl_middleName",
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
                    name="fl_familyName"
                    label={_labels.family}
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
                    clientIndividualFormValidation.setFieldValue(
                      "nationalityId",
                      newValue?.recordId,
                    );
                    clientIndividualFormValidation.setFieldValue(
                      "nationalityName",
                      newValue?.name,
                    );
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
                      clientIndividualFormValidation.setFieldValue(
                        "genderId",
                        newValue?.key,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "gender",
                        newValue?.value,
                      );
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
                      clientIndividualFormValidation.setFieldValue(
                        "educationLevel",
                        newValue?.key,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "educationLevelName",
                        newValue?.Value,
                      );
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
                <Grid item xs={12}>
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
              </Grid>
              <Grid item xs={12}>
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

              <FieldSet title={_labels.workAddress}>
              <AddressTab labels={_labels} addressValidation={WorkAddressValidation} countryStore={countryStore} cityStore={cityStore} lookupCity={lookupCity} stateStore={stateStore}  fillStateStore={fillStateStore}/>

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
