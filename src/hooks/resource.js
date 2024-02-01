import { useQuery, useQueryClient } from '@tanstack/react-query'
import useResourceParams from './useResourceParams'

export function useResourceQuery({ endpointId, datasetId, queryFn }) {
  const { access, labels } = useResourceParams({
    datasetId
  })

  const query = useQuery({
    queryKey: [endpointId],
    queryFn,
    enabled: access?.record?.maxAccess > 0
  })

  return {
    access,
    labels,
    query
  }
}

export function useInvalidate({ endpointId }) {
  const queryClient = useQueryClient()

  return function () {
    queryClient.invalidateQueries({
      queryKey: [endpointId]
    })
  }
}
