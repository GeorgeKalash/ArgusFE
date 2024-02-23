import { useQuery, useQueryClient } from '@tanstack/react-query'
import useResourceParams from './useResourceParams'
import { useState } from 'react'

export function useResourceQuery({ endpointId, datasetId, queryFn, search }) {
  const [searchValue, setSearchValue] = useState('')
  const isSearchMode = !!searchValue

  const { access, labels } = useResourceParams({
    datasetId
  })
  const queryClient = useQueryClient(); // Initialize the query client

  const query = useQuery({
    retry: false,
    refetchOnWindowFocus: false,
    queryKey: [endpointId , searchValue],
    queryFn: isSearchMode ? ({ queryKey: [_, qry] }) =>
   search.searchFn({
        qry
      }) :  ()=> queryFn(),
    enabled:  access?.record?.maxAccess > 0
  })

  return {
    access,
    labels,
    query: query,
    search(query) {
      setSearchValue(query)
    },
    clear() {
      setSearchValue('')
    },
    invalidate: () => {
      queryClient.invalidateQueries([endpointId]); // Invalidate queries when needed
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
