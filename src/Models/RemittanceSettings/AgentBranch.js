// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewAgentBranch = () => {
  return {
    agentId: null,
    swiftCode: null,
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

  }
}

const populateAgentBranch = obj => {
  return {
    recordId: obj.recordId,
    agentId: obj.agentId,
    swiftCode: obj.swiftCode,
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
    postalCode:obj.postalCode
  }
}

export { getNewAgentBranch, populateAgentBranch }
