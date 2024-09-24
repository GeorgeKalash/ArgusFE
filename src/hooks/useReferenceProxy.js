import { useQuery } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import refBehavior from 'src/lib/referenceBehavior'
import { RequestsContext } from 'src/providers/RequestsContext'

export function useRefBehavior({ access, readOnlyOnEditMode }) {
  const { getRequest } = useContext(RequestsContext)
  const [nraId, setNraId] = useState()

  const queryFn = async nraId => {
    const result = await refBehavior(getRequest, access, nraId, readOnlyOnEditMode)

    return result
  }

  const query = useQuery({
    retry: false,
    staleTime: 0,

    queryKey: [nraId, !!access],
    queryFn: () => queryFn(nraId)
  })

  return {
    refBehavior: query.data,
    maxAccess: query?.data?.maxAccess,
    changeDT(value) {
      setNraId(value?.nraId)
    }
  }
}