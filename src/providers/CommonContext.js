import { createContext, useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { AuthContext } from 'src/providers/AuthContext'

const CommonContext = createContext()

const CommonProvider = ({ children }) => {
  const { getRequest } = useContext(RequestsContext)
  const { user } = useContext(AuthContext)

  const fillDocumentTypeStore = ({ _startAt = 0, _pageSize = 30, _dgId = 0, callback }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams + `&_dgId=${_dgId}`

    getRequest({
      extension: SystemRepository.DocumentType.qry,
      parameters: parameters
    }).then(res => {
      callback(res.list)
    })
  }

  const getAllKvsByDataset = ({ _dataset = 0, callback }) => {
    var _language = user.languageId
    var parameters = `_dataset=${_dataset}&_language=${_language}`

    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters,
      disableLoading: true
    }).then(res => {
      callback(res.list)
    })
  }

  const values = {
    fillDocumentTypeStore,
    getAllKvsByDataset
  }

  return <CommonContext.Provider value={values}>{children}</CommonContext.Provider>
}

export { CommonContext, CommonProvider }
