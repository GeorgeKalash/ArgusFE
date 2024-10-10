import { useQuery } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import barcodeFieldBehaviours from 'src/lib/barcodeFieldBehaviours'

export function useBarcodeFieldBehaviours({ access, fieldName, editMode = true, store }) {
  const { getRequest } = useContext(RequestsContext)
  const [nraId, setNraId] = useState(store?.nraId || null)

  const queryFn = async nraId => {
    const result = await barcodeFieldBehaviours(getRequest, fieldName, access, nraId, editMode)

    return result
  }


  const query = useQuery({
    retry: false,
    staleTime: 0,
    queryKey: [nraId, !!access],
    queryFn: () => queryFn(nraId),
  })

  return {
    refBehavior: query.data,
    maxAccess: query?.data?.maxAccess,
    changeDT(nraId) {
      setNraId(nraId)
    }
  }
}
