import { useQuery, useQueryClient } from '@tanstack/react-query'
import useResourceParams from './useResourceParams'
import { useState } from 'react'

export function useResourceQuery({
  endpointId,
  filter,
  datasetId,
  DatasetIdAccess,
  queryFn,
  search,
  enabled = true,
  enabledOnApplyOnly = false,
  defaultLoad = true,
  params
}) {
  const [searchValue, setSearchValue] = useState('')
  const [filters, setFilters] = useState(filter?.default || {})
  const [apiOption, setApiOption] = useState('')
  const isSearchMode = !!searchValue
  const [isdisabled, setIsDisabled] = useState(enabledOnApplyOnly)
  const [autoLoad, setAutoload] = useState(defaultLoad)

  const isFilterMode =
    Object.keys(filters).length > 0 &&
    Object.values(filters).every(
      value => value !== null && value !== undefined && (typeof value !== 'string' || value.trim() !== '')
    )

  const { access, labels } = useResourceParams({
    datasetId,
    DatasetIdAccess,
    cacheOnlyMode: params?.disabledReqParams
  })
  const queryClient = useQueryClient()

  const accessValue = access || params?.maxAccess

  const query = useQuery({
    retry: false,
    queryKey: [endpointId, searchValue, JSON.stringify(filters), apiOption],
    queryFn: isSearchMode
      ? ({ queryKey: [_, qry] }) =>
          search.searchFn({
            qry
          })
      : isFilterMode
      ? ({ queryKey: [_, __] }) =>
          filter.filterFn({
            filters,
            pagination: apiOption
          })
      : autoLoad && (apiOption ? () => queryFn(apiOption) : () => queryFn()),
    enabled: accessValue?.record?.maxAccess > 0 && enabled && !isdisabled
  })

  return {
    access,
    labels,
    query: query,
    search(value) {
      if (value === searchValue) {
        query.refetch()
      } else {
        setSearchValue(value)
      }
    },
    filterBy(name, value, report) {
      !autoLoad && setAutoload(true)
      if (value === filters[name]) {
        query.refetch()
      } else if (report || name === 'params') {
        setFilters({
          [name]: value
        })
      } else {
        setFilters({
          ...filters,
          [name]: value
        })
      }
      if (isdisabled) setIsDisabled(false)
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
      queryClient.invalidateQueries({
        queryKey: [endpointId]
      })
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
