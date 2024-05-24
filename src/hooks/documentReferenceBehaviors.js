import { useQuery } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import { useError } from 'src/error'
import documentType from 'src/lib/docRefBehaviors'
import { RequestsContext } from 'src/providers/RequestsContext'

export function useDocumentType({ functionId, access, hasDT, action, enabled = true }) {
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const [nraId, setNraId] = useState()
  const [proxyState, setProxyState] = useState(enabled)

  const proxyAction = async () => {
    setProxyState(true)
    const general = await documentType(getRequest, functionId)
    if (!general?.errorMessage) {
      await action()
    } else {
      stackError({ message: general?.errorMessage })
    }
  }

  const queryFn = async nraId => {
    const result = await documentType(getRequest, functionId, access, nraId, hasDT)
    if (result.errorMessage) {
      stackError({ message: result?.errorMessage })

      return
    } else {
      return result
    }
  }

  const query = useQuery({
    retry: false,
    enabled: proxyState && !!functionId,
    queryKey: [functionId, nraId],
    queryFn: nraId || nraId === 'naraId' ? () => queryFn(nraId) : () => queryFn()
  })

  return {
    access,
    documentType: query.data,
    maxAccess: query?.data?.maxAccess,
    changeDT(value) {
      setNraId(value?.nraId ?? 'nraId')
    },
    proxyAction
  }
}

export default useDocumentType
