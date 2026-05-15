import { useQuery } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import fieldBehaviors from '@argus/shared-domain/src/lib/fieldBehaviors'

export function useFieldBehavior({ access, key, editMode = true, enableClearing }) {
  const { getRequest } = useContext(RequestsContext)
  const [nraId, setNraId] = useState()

  const queryFn = async (nraId) => {
    return await fieldBehaviors(getRequest, key, access, nraId, editMode)
  }

  const query = useQuery({
    retry: false,
    staleTime: 0,
    queryKey: [key, nraId, !!access],
    queryFn: () => queryFn(nraId)
  })

  return {
    fieldBehavior: {
      key,
      isEmpty: enableClearing
        ? query?.data?.field?.readOnly && !query?.data?.field?.mandatory
        : false
    },
    maxAccess: query?.data?.maxAccess || access,
    onChange(value) {
      setNraId(value)
    }
  }
}