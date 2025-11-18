import { useQuery } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import fieldBehaviors from 'src/lib/fieldBehaviors'

export function useFieldBehavior({ access, fieldName, editMode = true }) {
  const { getRequest } = useContext(RequestsContext)
  const [nraId, setNraId] = useState()

  const queryFn = async nraId => {
    const result = await fieldBehaviors(getRequest, fieldName, access, nraId, editMode)

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
