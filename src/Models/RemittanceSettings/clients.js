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
 //clientIDView
 reference: null,

 clientId: null,
 expiryDate: null,
 issusDate: null,
 idCountry: null,
 idCity: null,
 idNo: null,
 idNoRepeat: null,
 idNoEncrypt: null,
 idNoRepeatEncrypt: null,

 idtId:null,

//  isDiplomatic:false,

 // country: obj.clientIDView.countryName,
 cityName: null,

 //address
 countryId: null,
 cityId: null,
 city: null,
 stateId: null,
 cityDistrictId :null,
 email1: null,
 email2: null,
 name: null,
 phone: null,
 phone2: null,
 phone3: null,
 postalCode: null,
 street1: null,
 street2: null,
 subNo: null,
 unitNo: null,

 //end address

//  whatsappNo: obj.whatsappNo,
//  sponsorName: obj.sponsorName,


 //clientIndividual
 birthDate: null,
 firstName: null,
 lastName: null,
 middleName: null,
 familyName: null,
 fl_firstName: null,
 fl_lastName: null,
 fl_middleName: null,
 fl_familyName: null,
 isResident: false,

 // end clientIndividual



 //clientMaster
 addressId: null,
 category: null,
 nationalityId: null,
 nationality: null,
 cellPhone:null,
 cellPhoneEncrypt : null,
 cellPhoneRepeatEncrypt : null,
 cellPhoneRepeat:null,
 createdDate  :null,
 isDiplomatReadOnly: false,

 // expiryDate  :obj.clientMaster.expiryDate,
 flName  :null,
 keyword  :null,
 otp  :null,
 status  : null,
 plantId  :null,
 name  :null,
 oldReference: null,



 //clientRemittance

 OTPVerified: false,
 addressId: null,
 batchId: null,
 civilStatus: null,
 clientId: null,
 coveredFace: false,
 date: null,
 dtId: null,
 educationLevel:null,
 gender: null,
 idNo: null,
 incomeSourceId: null,
 isDiplomat: false,
 isEmployee:false,
 relativeDiplomatInfo: null,
 releaseStatus: null,
 riskLevel: null,
 salary: null,
 salaryRange: null,
 smsLanguage: null,
 sponsorName: null,
 status: null,
 whatsAppNo: null,
 wip: null,
 workAddressId: null,
 title: null,
 mobileVerified: null,
 isRelativeDiplomat: false,
 professionId:null,
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
      cityName: obj.clientIDView.idCityName,

      //address
      countryId: obj.addressView.countryId,
      cityId: obj.addressView.cityId,
      city: obj.addressView.city,
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
     recordId:  obj.clientRemittance.recordId,
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

      // isDiplomat: obj.clientRemittance.isDiplomat,
      isEmployee: obj.clientRemittance.isEmployee,
      relativeDiplomatInfo: obj.clientRemittance.relativeDiplomatInfo,
      releaseStatus: obj.clientRemittance.releaseStatus,
      riskLevel: obj.clientRemittance.riskLevel,

      // salary: obj.clientRemittance.salary,
      salaryRangeId: obj.clientRemittance.salaryRangeId,
      smsLanguage: obj.clientRemittance.smsLanguage,
      sponsorName: obj.clientRemittance.sponsorName,
      status:obj.clientRemittance.status,
      whatsAppNo: obj.clientRemittance.whatsAppNo,
      wip:obj.clientRemittance.wip,
      workAddressId: obj.clientRemittance.workAddressId,
      title: obj.clientRemittance.title,
      mobileVerified: obj.clientRemittance.mobileVerifiedStatus,
      isRelativeDiplomat: obj.clientRemittance.isRelativeDiplomat,

      professionId: obj.clientRemittance.professionId,

      // profession: obj.profession,
      // professionId: obj.professionId,
      // oldReference: obj.oldReference,
      // salaryRange: obj.salaryRange,
      // salaryRangeId: obj.salaryRangeId,



      // isEmployee: obj.isEmployee,
      // isDiplomatic: obj.isDiplomatic,
      // isRelativeDiplomate: obj.isRelativeDiplomate,


  }
}



export { getNewClients, populateIClients }
