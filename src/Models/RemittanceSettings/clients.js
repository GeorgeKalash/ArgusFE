// ** Helpers
import { formatDateFromApi } from "src/lib/date-helper"


const encryptValue = (value) => {
  const input = value
  const showLength = Math.max(0, input.length - 4);

  // Check if input has at least four digits

const maskedValue =
  '*'.repeat(showLength) + input.substring(showLength);

  //  clientIndividualFormValidation.setFieldValue("numberRepeat", input)

return maskedValue
};

const getNewClients= () => {
  return {
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
    idCountry: null,
    idCity: null,
    country: null,
    city: null,
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
    cellPhoneEncrypt : null,
    cellPhoneRepeatEncrypt : null,
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
    otp: null,
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
  }
}

const populateIClients= obj => {
  return {


      //clientIDView
      reference: obj.clientMaster.reference,

      clientId: obj.clientIDView.clientId,
      expiryDate: obj.clientIDView.idExpiryDate  && formatDateFromApi(obj.clientIDView.idExpiryDate),
      issusDate: obj.clientIDView.idIssusDate  && formatDateFromApi(obj.clientIDView.idIssusDate),
      idCountry: obj.clientIDView.idCountryId,
      idCity: obj.clientIDView.idCityId,
      idNo: obj.clientIDView.idNo,
      idNoRepeat: obj.clientIDView.idNo ,
      idNoEncrypt: obj.clientIDView.idNo && encryptValue(obj.clientIDView.idNo) ,
      idNoRepeatEncrypt: obj.clientIDView.idNo && encryptValue(obj.clientIDView.idNo) ,

      idtId: obj.clientIDView.idtId,
      isDiplomat: obj.clientIDView.isDiplomat,

      // country: obj.clientIDView.countryName,
      city: obj.clientIDView.idCityName,

      //address
      countryId: obj.addressView.countryId,
      cityId: obj.addressView.cityId,
      city: obj.addressView.cityName,
      stateId: obj.addressView.stateId,
      cityDistrictId :obj.addressView.cityDistrictId,
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

      // end clientIndividual



      //clientMaster
      addressId: obj.clientMaster.addressId,
      category: obj.clientMaster.category,
      nationalityId: obj.clientMaster.nationalityId,
      nationality: obj.clientMaster.nationality,
      cellPhone: obj.clientMaster.cellPhone,
      cellPhoneEncrypt : obj.clientMaster.cellPhone  && encryptValue(obj.clientMaster.cellPhone),
      cellPhoneRepeatEncrypt : obj.clientMaster.cellPhone  && encryptValue(obj.clientMaster.cellPhone),
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
      incomeSourceId: obj.clientRemittance.incomeSourceId,
      isDiplomat: obj.clientRemittance.isDiplomat,
      isEmployee: obj.clientRemittance.isEmployee,
      relativeDiplomatInfo: obj.clientRemittance.relativeDiplomatInfo,
      releaseStatus: obj.clientRemittance.releaseStatus,
      riskLevel: obj.clientRemittance.riskLevel,
      salary: obj.clientRemittance.salary,
      salaryRange: obj.clientRemittance.salaryRange,
      smsLanguage: obj.clientRemittance.smsLanguage,
      sponsorName: obj.clientRemittance.sponsorName,
      status:obj.clientRemittance.status,
      whatsAppNo: obj.clientRemittance.whatsAppNo,
      wip:obj.clientRemittance.wip,
      workAddressId: obj.clientRemittance.workAddressId,
      title: obj.clientRemittance.title,
      mobileVerified: obj.clientRemittance.mobileVerifiedStatus,
      isRelativeDiplomat: obj.clientRemittance.isRelativeDiplomat,

      // professionId: obj.professionId,
      // profession: obj.profession,
      // professionId: obj.professionId,
      // oldReference: obj.oldReference,
      // salaryRange: obj.salaryRange,
      // salaryRangeId: obj.salaryRangeId,



      // isEmployee: obj.isEmployee,
      // isDiplomat: obj.isDiplomat,
      // isRelativeDiplomate: obj.isRelativeDiplomate,


  }
}



export { getNewClients, populateIClients }
