import { useQuery } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import { useError } from 'src/error'
import documentType from 'src/lib/docRefBehaviors'
import { RequestsContext } from 'src/providers/RequestsContext'

export function useDocumentTypeProxy({ functionId, action, hasDT }) {
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()

  const proxyAction = async () => {
    const general = await documentType(getRequest, functionId, '', undefined, hasDT)
    if (!general?.errorMessage) {
      await action()
    } else {
      stackError({ message: general?.errorMessage })
    }
  }

  return {
    proxyAction
  }
}

export function useDocumentType({ functionId, access, hasDT, enabled = true }) {
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const [nraId, setNraId] = useState()

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
    staleTime: 0,
    enabled: [!!functionId, functionId == undefined] && enabled,
    queryKey: [functionId, nraId, !!access],
    queryFn: nraId || nraId === 'nraId' ? () => queryFn(nraId) : () => queryFn()
  })

  return {
    documentType: query.data,
    maxAccess: query?.data?.maxAccess,
    changeDT(value) {
      setNraId(value?.nraId || 'nraId')
    }
  }
}
