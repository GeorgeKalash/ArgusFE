import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useContext } from 'react'
import documentType from 'src/lib/docRefBehaivors'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

// const useDocumentType = (functionId, access, selectNraId = undefined, hasDT = true) => {
//   const { getRequest } = useContext(RequestsContext)

//   console.log('selectNraId-1', selectNraId)

//   const [docTypeState, setDocTypeState] = useState({
//     dtId: null,
//     dcTypeRequired: null,
//     reference: null,
//     errorMessage: null,
//     access: null
//   })

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         ;async (repository, id) => {
//           let extension, parameters
//           switch (repository) {
//             case 'dtId':
//               const userData =
//                 window && window.sessionStorage.getItem('userData')
//                   ? JSON.parse(window.sessionStorage.getItem('userData'))
//                   : null
//               const userId = userData?.userId
//               parameters = `_userId=${userId}&_functionId=${id}`
//               extension = SystemRepository.UserFunction.get
//               break
//             case 'glbSysNumberRange':
//               parameters = `_recordId=${id}`
//               extension = SystemRepository.SystemFunction.get
//               break
//             case 'DocumentType':
//               parameters = `_dgId=${id}&_startAt=${0}&_pageSize=${50}`
//               extension = SystemRepository.DocumentType.qry
//               break
//             case 'DcTypNumberRange':
//               parameters = `_recordId=${id}`
//               extension = SystemRepository.DocumentType.get
//               break
//             case 'isExternal':
//               parameters = `_recordId=${id}`
//               extension = SystemRepository.NumberRange.get
//               break
//             default:
//               return null
//           }

//           return await getData(getRequest, extension, parameters)
//         }

//         const getData = async (getRequest, extension, parameters) => {
//           try {
//             const res = await getRequest({
//               extension,
//               parameters
//             })

//             return extension.includes('qry') ? res : res.record
//           } catch (error) {
//             return null
//           }
//         }

//         const documentType = async () => {
//           const docType = selectNraId === undefined && (await fetchData('dtId', functionId)) // ufu
//           const dtId = docType?.dtId
//           let nraId
//           let errorMessage
//           let reference
//           let isExternal
//           let dcTypeRequired
//           let activeStatus = true
//           let controls

//           if (docType && selectNraId === undefined) {
//             if (dtId) {
//               const dcTypNumberRange = await fetchData('DcTypNumberRange', dtId) //DT
//               nraId = dcTypNumberRange?.nraId
//               activeStatus = dcTypNumberRange?.activeStatus < 0 ? false : true
//               if (!nraId) {
//                 errorMessage = 'Assign the document type to a number range'
//               }
//             }
//             if ((!dtId || !activeStatus) && hasDT) {
//               const documentType = await fetchData('DocumentType', functionId) //qryDT
//               dcTypeRequired = documentType?.list?.filter(item => item?.activeStatus === 1).length > 0
//             }
//           }

//           if (selectNraId === null || (selectNraId === undefined && !dcTypeRequired)) {
//             if (((!dtId || (!dcTypeRequired && dtId)) && !nraId) || (nraId && !activeStatus)) {
//               const glbSysNumberRange = await fetchData('glbSysNumberRange', functionId) //fun
//               nraId = glbSysNumberRange?.nraId
//               activeStatus = true
//             }
//             if (!nraId && !dcTypeRequired) {
//               errorMessage = 'Assign the document type to a number range'
//             }
//           }

//           if (selectNraId > 0 && !nraId) {
//             nraId = selectNraId
//           }

//           if (nraId && activeStatus) {
//             isExternal = await fetchData('isExternal', nraId)
//             reference = {
//               readOnly: isExternal?.external ? false : true,
//               mandatory: isExternal?.external ? true : false
//             }
//             if (access.record && typeof access.record === 'object') {
//               controls = access.record.controls
//               let obj = controls.find(obj => obj.controlId === 'reference')
//               console.log('obj', obj)
//               if (obj) {
//                 obj.accessLevel = reference?.mandatory
//               } else {
//                 controls.push({
//                   sgId: 18,
//                   resourceId: ResourceIds.JournalVoucher,
//                   controlId: 'reference',
//                   accessLevel: reference?.mandatory && 2
//                 })
//               }
//               if (dcTypeRequired) {
//                 controls.push({
//                   sgId: 18,
//                   resourceId: ResourceIds.JournalVoucher,
//                   controlId: 'dtId',
//                   accessLevel: 2
//                 })
//               }
//             }
//           }

//           return {
//             dtId,
//             dcTypeRequired,
//             reference,
//             errorMessage,
//             access
//           }
//         }

//         const result = await documentType()
//         setDocTypeState(result)
//       } catch (error) {
//         console.error('Error fetching data:', error)
//       }
//     }

//     fetchData()
//   }, [access])

//   return docTypeState
// }

export function useDocumentType({ functionId, access }) {
  const { getRequest } = useContext(RequestsContext)
  const [nraId, setNraId] = useState('')
  const [fId, setFId] = useState(functionId)

  const queryFn = async nraId => {
    return await documentType(getRequest, functionId, access, nraId)
  }

  const query = useQuery({
    retry: false,
    queryKey: [fId, nraId],
    queryFn: nraId || nraId === 'naraId' ? () => queryFn(nraId) : () => queryFn()
  })

  return {
    access,
    query: query,
    maxAccess: query?.data?.maxAccess,
    onChangeNra(nra_id) {
      setNraId(nra_id)
    },
    onChangeFunction(fId) {
      setFId(fId)
    }
  }
}

export default useDocumentType
