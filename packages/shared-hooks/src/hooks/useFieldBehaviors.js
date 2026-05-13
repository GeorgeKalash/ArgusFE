import { useQuery } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import fieldBehaviors from '@argus/shared-domain/src/lib/fieldBehaviors'

export function useFieldBehavior({ access, fieldName, editMode = true, enableClearing }) {
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
    fieldBehavior: {
      fieldName,
      isEmpty: enableClearing ? query?.data?.field?.readOnly && !query?.data?.field?.mandatory : false
    },
    changeDT(value) {
      setNraId(value)
    }
  }
}
