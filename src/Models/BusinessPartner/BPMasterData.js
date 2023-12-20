// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewBPMasterData = () => {
  return {
    recordId: null,
    reference: null,
    name: null,
    category: null,
    categoryName: null,
    groupId: null,
    groupName: null,
    flName: null,
    defaultInc: null,
    isInactive: null,
    keywords: null,
    plId: null,
    shipAddressId: null,
    billAddressId: null,
    birthDate: null,
    birthPlace: null,
    nationalityId: null,
    legalStatusId: null,
    isBlackListed: null,
    groupName: null,
    nationalityName: null,
    nationalityRef: null,
    legalStatus: null
  }
}

const populateBPMasterData = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    name: obj.name,
    category: obj.category,
    categoryName: obj.categoryName,
    groupId: obj.groupId,
    groupName: obj.groupName,
    flName: obj.flName,
    defaultInc: obj.defaultInc,
    isInactive: obj.isInactive,
    keywords: obj.keywords,
    plId: obj.plId,
    shipAddressId: obj.shipAddressId,
    billAddressId: obj.billAddressId,
    birthDate: obj.birthDate,
    birthPlace: obj.birthPlace,
    nationalityId: obj.nationalityId,
    legalStatusId: obj.legalStatusId,
    isBlackListed: obj.isBlackListed,
    groupName: obj.groupName,
    nationalityName: obj.nationalityName,
    nationalityRef: obj.nationalityRef,
    legalStatus: obj.legalStatus
  }
}

export { getNewBPMasterData, populateBPMasterData }
