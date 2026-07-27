import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { KVSRepository } from '@argus/repositories/src/repositories/KVSRepository'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { AuthContext } from './AuthContext'
import axios from 'axios'
import { useError } from '@argus/shared-providers/src/providers/error'
import { commonResourceIds } from '@argus/shared-domain/src/resources/commonResourceIds'
import { useLabelsAccessContext } from './LabelsAccessContext'

const ControlContext = createContext()

const ControlProvider = ({ children }) => {
  const { getRequest } = useContext(RequestsContext)
  const { apiUrl, languageId } = useContext(AuthContext)
  const errorModel = useError()
  const { labels, setLabels, access, setAccess } = useLabelsAccessContext()

  const addLabels = (resourceId, labels) => {
    setLabels(prevData => ({ ...prevData, [resourceId]: labels }))
  }
  const addAccess = (resourceId, access) => {
    setAccess(prevData => ({ ...prevData, [resourceId]: access }))
  }
  async function showError(props) {
    if (errorModel) await errorModel.stack(props)
  }

  const { data: apiPlatformLabels } = useQuery({
    queryKey: ['platformLabels', apiUrl, languageId],
    queryFn: async () => {
      const res = await axios({
        method: 'GET',
        url: apiUrl + KVSRepository.getPlatformLabels + '?' + '_dataset=' + ResourceIds.Common + `&_language=${languageId || 1}`,
        headers: {
          'Content-Type': 'multipart/form-data',
          LanguageId: languageId
        }
      })
      return res?.data?.list || []
    },
    enabled: !!apiUrl && !!languageId,
    staleTime: Infinity,
    retry: false,
    onError: error =>
      showError({
        message: error,
        height: error.response?.status === 404 || error.response?.status === 500 ? 400 : ''
      })
  })

  const platformLabels = apiPlatformLabels
    ? Object.fromEntries(apiPlatformLabels.map(({ key, value }) => [key, value]))
    : {}

  const getLabels = (resourceId, callback, cacheOnlyMode) => {
    const cache = commonResourceIds.includes(resourceId)
    if ((cache && labels?.[resourceId]) || cacheOnlyMode) {
      callback(labels?.[resourceId])
    } else {
      getRequest({
        extension: KVSRepository.getLabels,
        parameters: '_dataset=' + resourceId
      }).then(res => {
        if (res?.list) {
          if (cache && !labels?.[resourceId]) {
            addLabels(resourceId, res.list)
          }
          callback(res.list)
        }
      })
    }
  }

  const getAccess = (resourceId, callback, cacheOnlyMode) => {
    const cache = commonResourceIds.includes(resourceId)
    if ((cache && access?.[resourceId]) || cacheOnlyMode) {
      callback(access?.[resourceId])
    } else {
      getRequest({
        extension: AccessControlRepository.maxAccess,
        parameters: '_resourceId=' + resourceId
      }).then(res => {
        if (res?.record) {
          if (cache && !access?.[resourceId]) {
            addAccess(resourceId, res)
          }
          callback(res)
        }
      })
    }
  }

  const values = { getLabels, getAccess, platformLabels }
  return <ControlContext.Provider value={values}>{children}</ControlContext.Provider>
}

export { ControlContext, ControlProvider }