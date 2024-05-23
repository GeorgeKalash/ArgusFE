import { useQuery } from '@tanstack/react-query'
import { useContext } from 'react'
import { useError } from 'src/error'
import documentType from 'src/lib/docRefBehaviors'
import { RequestsContext } from 'src/providers/RequestsContext'

export function useDocumentType({ functionId, access, nraId, hasDT, action }) {
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()

  const proxyAction = async () => {
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
    enabled: functionId && true,
    queryKey: [functionId, nraId],
    queryFn: nraId || nraId === 'naraId' ? () => queryFn(nraId) : () => queryFn()
  })

  return {
    access,
    query: query,
    maxAccess: query?.data?.maxAccess,
    proxyAction
  }
}

export default useDocumentType
