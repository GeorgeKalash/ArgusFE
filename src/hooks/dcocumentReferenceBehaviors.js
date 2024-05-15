import { useQuery } from '@tanstack/react-query'
import { useState, useContext } from 'react'
import { useError } from 'src/error'
import documentType from 'src/lib/docRefBehaivors'
import { RequestsContext } from 'src/providers/RequestsContext'

export function useDocumentType({ functionId, access, hasDT }) {
  const { getRequest } = useContext(RequestsContext)
  const [nraId, setNraId] = useState('')
  const [fId, setFId] = useState(functionId)
  const { stack: stackError } = useError()

  const queryFn = async nraId => {
    const result = await documentType(getRequest, fId, access, nraId, hasDT)
    if (result.errorMessage) {
      stackError({ message: result?.errorMessage })

      return
    } else {
      return result
    }
  }

  const query = useQuery({
    retry: false,
    enabled: fId && true,
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
