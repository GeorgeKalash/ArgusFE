import { useQuery, useQueryClient } from '@tanstack/react-query'
import useResourceParams from './useResourceParams'
import { useState } from 'react'

export function useResourceQuery({ endpointId, datasetId, queryFn, search }) {
  const [searchValue, setSearchValue] = useState('')
  const isSearchMode = !!searchValue

  const { access, labels } = useResourceParams({
    datasetId
  })

  const searchQuery = useQuery({
    queryKey: [endpointId, searchValue],
    queryFn: ({ queryKey: [_, qry] }) =>
      search.searchFn({
        qry
      }),
    enabled: isSearchMode && access?.record?.maxAccess > 0
  })

  const query = useQuery({
    queryKey: [endpointId],
    queryFn: () => queryFn(),
    enabled: access?.record?.maxAccess > 0
  })

  return {
    access,
    labels,
    query: isSearchMode ? searchQuery : query,
    search(query) {
      setSearchValue(query)
    }
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
