import { useQuery } from '@tanstack/react-query'
import { useState, useContext } from 'react'
import { useError } from 'src/error'
import documentType from 'src/lib/docRefBehaivors'
import { RequestsContext } from 'src/providers/RequestsContext'

export function useDocumentType({ functionId, access, nraId, hasDT }) {
  const { getRequest } = useContext(RequestsContext)

  // const [fId, setFId] = useState(functionId)
  const { stack: stackError } = useError()

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
    maxAccess: query?.data?.maxAccess
  }
}

export default useDocumentType
