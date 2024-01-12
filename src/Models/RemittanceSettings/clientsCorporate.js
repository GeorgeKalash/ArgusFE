// ** Helpers
import { formatDateFromApi } from "src/lib/date-helper"

const getNewClientCorporate= () => {
  return {

 //ClientCorporate


 clientId: null,
 lgsId: null,
 industry:null,
 activityId:null,
 capital:null,
 trading:false,
 outward:false,
 inward:false,

 //address

 cityName: null,
 countryId: null,
 cityId: null,
 city: null,
 stateId: null,
 cityDistrictId :null,
 email1: null,
 email2: null,
 name1: null,
 phone: null,
 phone2: null,
 phone3: null,
 postalCode: null,
 street1: null,
 street2: null,
 subNo: null,
 unitNo: null,

 //end address




 //clientMaster
 category: null,
 reference: null,
 name  :null,
 flName  :null,
 keyword  :null,
 nationalityId: null,

 expiryDate: null,
 addressId: null,
 category: null,

 createdDate  :null,
 status  : null,
 addressId: null,

 plantId: null,
 cellPhone:null,
 cellPhoneRepeat:null,
 otp  :null,




  }
}

const populateClientCorporate= obj => {
  return {


 clientId: obj.clientCorporate.clientId,
 lgsId: obj.clientCorporate.lgsId,
 industry: obj.clientCorporate.industry,
 activityId: obj.clientCorporate.activityId,
 capital:obj.clientCorporate.capital,
 trading:obj.clientCorporate.trading,
 outward:obj.clientCorporate.outward,
 inward:obj.clientCorporate.inward,

 //address

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




 //clientMaster
 category: obj.clientMaster.category,
 reference: obj.clientMaster.reference,
 name1  :obj.clientMaster.name,
 flName  :obj.clientMaster.flName,
 keyword  :obj.clientMaster.keyword,
 nationalityId: obj.clientMaster.nationalityId,
 expiryDate: obj.clientMaster.expiryDate && formatDateFromApi(obj.clientMaster.expiryDate),
 createdDate  :obj.clientMaster.createdDate && formatDateFromApi(obj.clientMaster.createdDate),
 status  : obj.clientMaster.status,
 addressId: obj.clientMaster.addressId,
 plantId: obj.clientMaster.plantId,
 cellPhone:obj.clientMaster.cellPhone,
 otp  :obj.clientMaster.otp,


  }
}



export { getNewClientCorporate , populateClientCorporate }
