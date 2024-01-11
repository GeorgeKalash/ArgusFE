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


 clientId: null,
 lgsId: null,
 industry:null,
 activityId:null,
 capital:null,
 trading:null,
 outward:null,
 inward:null,

 //address

 cityName: null,
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



export { getNewClientCorporate , populateClientCorporate }
