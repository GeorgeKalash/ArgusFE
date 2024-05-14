import { useQuery } from '@tanstack/react-query'
import { useState, useContext } from 'react'
import documentType from 'src/lib/docRefBehaivors'
import { RequestsContext } from 'src/providers/RequestsContext'

export function useDocumentType({ functionId, access, hasDT }) {
  const { getRequest } = useContext(RequestsContext)
  const [nraId, setNraId] = useState('')
  const [fId, setFId] = useState(functionId)

  const queryFn = async nraId => {
    return await documentType(getRequest, fId, access, nraId, hasDT)
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
