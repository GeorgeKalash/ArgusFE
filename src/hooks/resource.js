import { useQuery, useQueryClient } from '@tanstack/react-query'
import useResourceParams from './useResourceParams'
import { useState } from 'react'

export function useResourceQuery({ endpointId, filter, datasetId, queryFn, search }) {
  const [searchValue, setSearchValue] = useState('')
  const [filters, setFilters] = useState({})
  const [apiOption, setApiOption] = useState('')

  const isSearchMode = !!searchValue

  const isFilterMode = Object.keys(filters).length > 0

  const { access, labels } = useResourceParams({
    datasetId
  })
  const queryClient = useQueryClient()

  const query = useQuery({
    // retry: false,
    // refetchOnWindowFocus: false,
    queryKey: [endpointId, searchValue, JSON.stringify(filters), apiOption],
    queryFn: isSearchMode
      ? ({ queryKey: [_, qry] }) =>
          search.searchFn({
            qry
          })
      : isFilterMode
      ? ({ queryKey: [_, __] }) =>
          filter.filterFn({
            filters
          })
      : apiOption
      ? () => queryFn(apiOption)
      : () => queryFn(),
    enabled: access?.record?.maxAccess > 0
  })

  return {
    access,
    labels,
    query: query,
    search(query) {
      setSearchValue(query)
    },
    filterBy(name, value) {
      setFilters({
        ...filters,
        [name]: value
      })
    },
    clearFilter(name) {
      setFilters(filters => {
        const newFilters = { ...filters }
        delete newFilters[name]

        return newFilters
      })
    },
    filters,
    paginationParameters(res) {
      setApiOption(res)
    },
    clear() {
      setSearchValue('')
      setFilters({})
    },
    refetch() {
      query.refetch()
    },
    invalidate: () => {
      queryClient.invalidateQueries([endpointId])
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
