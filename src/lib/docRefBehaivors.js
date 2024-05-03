// import { SystemRepository } from 'src/repositories/SystemRepository'

// const getData = async (getRequest, extension, parameters) => {
//   try {
//     const res = await getRequest({
//       extension,
//       parameters
//     })

//     return res?.record
//   } catch (error) {
//     return null
//   }
// }

// const defaultDocumentType = async (getRequest, functionId) => {
//   const userData =
//     window && window.sessionStorage.getItem('userData') ? JSON.parse(window.sessionStorage.getItem('userData')) : null
//   const userId = userData?.userId
//   const parameters = `_userId=${userId}&_functionId=${functionId}`
//   const extension = SystemRepository.UserFunction.get

//   return await getData(getRequest, extension, parameters)
// }

// const getNumberRange = async (getRequest, functionId, extension) => {
//   const parameters = `_recordId=${functionId}`

//   return await getData(getRequest, extension, parameters)
// }

// const numberRange = async (getRequest, functionId) => {
//   const extension = SystemRepository.SystemFunction.get

//   return await getNumberRange(getRequest, functionId, extension)
// }

// const numberRangeYes = async (getRequest, functionId) => {
//   const extension = SystemRepository.DocumentType.get

//   return await getNumberRange(getRequest, functionId, extension)
// }

// const numberRangeInternal = async (getRequest, functionId) => {
//   const parameters = `_recordId=${functionId}`
//   const extension = SystemRepository.NumberRange.get

//   return await getData(getRequest, extension, parameters)
// }

// const general = (getRequest, functionId) => {
//   const res1 = defaultDocumentType(getRequest, functionId)

//   // const res2 = numberRange(getRequest, functionId)
//   // const res3 = numberRangeYes(getRequest, functionId)

//   // const res4 = general(getRequest, functionId)
//   if (res1) return res1
// }

// export { general, numberRange, numberRangeYes, numberRangeInternal }

import { SystemRepository } from 'src/repositories/SystemRepository'

const getData = async (getRequest, extension, parameters) => {
  try {
    const res = await getRequest({
      extension,
      parameters
    })

    return res?.record
  } catch (error) {
    return null
  }
}

const fetchData = async (getRequest, id, repository) => {
  let extension, parameters

  switch (repository) {
    case 'UserDefault': //default user
      const userData =
        window && window.sessionStorage.getItem('userData')
          ? JSON.parse(window.sessionStorage.getItem('userData'))
          : null
      const userId = userData?.userId
      parameters = `_userId=${userId}&_functionId=${id}`
      extension = SystemRepository.UserFunction.get
      break
    case 'glbSysNumberRange': //get numberRange  if no userDefault
      parameters = `_recordId=${id}`
      extension = SystemRepository.SystemFunction.get
      break
    case 'DcTypNumberRange': //get numberRange if user has userDefault
      parameters = `_recordId=${id}`
      extension = SystemRepository.DocumentType.get
      break
    case 'isExternal':
      parameters = `_recordId=${id}`
      extension = SystemRepository.NumberRange.get
      break
    default:
      return null // Invalid repository
  }

  return await getData(getRequest, extension, parameters)
}

const reference = async (getRequest, functionId) => {
  const userDefault = await fetchData(getRequest, functionId, 'UserDefault')
  let numberRange
  let errorMessage
  let reference
  let isExternal
  if (userDefault) {
    numberRange = await fetchData(getRequest, userDefault.dtId, 'DcTypNumberRange')
  } else {
    numberRange = await fetchData(getRequest, functionId, 'glbSysNumberRange')
    if (!numberRange.recordId) {
      errorMessage = 'Assign a number Range to system function'
    }
  }
  if (numberRange) {
    isExternal = await fetchData(getRequest, numberRange.nraId, 'isExternal')
    if (isExternal?.external) {
      //editable and mandatory
      reference = { readOnly: false, mandatory: true }
    } else {
      //readOnly  and not mandatory
      reference = { readOnly: true, mandatory: false }
    }
  }

  return {
    userDefault: userDefault?.dtId,
    numberRange: numberRange?.nraId,
    external: isExternal?.external,
    reference,
    errorMessage
  }
}

export default reference
