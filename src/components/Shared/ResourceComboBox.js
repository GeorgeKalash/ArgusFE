import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { useContext, useEffect, useState, useRef } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CommonContext } from 'src/providers/CommonContext'
import { useCacheDataContext } from 'src/providers/CacheDataContext'
import { useCacheStoreContext } from 'src/providers/CacheStoreContext'

export default function ResourceComboBox({
  endpointId,
  datasetId,
  valueField = 'recordId',
  values = {},
  parameters = '_filter=',
  dynamicParams,
  filter = () => true,
  dataGrid,
  value,
  reducer = res => res?.list,
  refresh,
  setData,
  ...rest
}) {
  const { store: data } = rest

  const { getRequest } = useContext(RequestsContext)
  const { updateStore, fetchWithCache } = useCacheDataContext() || {}
  const { cacheStore = {}, updateCacheStore = () => {} } = useCacheStoreContext() || {}

  const cacheAvailable = !!updateStore
  const { getAllKvsByDataset } = useContext(CommonContext)

  const [apiResponse, setApiResponse] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const finalItemsListRef = useRef([])

  const key = endpointId || datasetId
  const noCache = Boolean(dynamicParams)

  function fetch({ datasetId, endpointId, parameters }) {
    if (endpointId) {
      const fullParameters = dynamicParams ? parameters + '&' + dynamicParams : parameters

      return getRequest({
        extension: endpointId,
        parameters: fullParameters,
        disableLoading: true
      })
    } else if (datasetId) {
      return new Promise(resolve => {
        getAllKvsByDataset({
          _dataset: datasetId,
          callback: resolve
        })
      })
    }
  }

  useEffect(() => {
    const fetchDataAsync = async () => {
      await fetchData(false)
    }

    fetchDataAsync()
  }, [parameters])

  const fetchData = async (refresh = true) => {
    if (parameters && !data && (datasetId || endpointId)) {
      setIsLoading(true)

      const data =
        !noCache && cacheStore?.[key] && !refresh
          ? cacheStore?.[key]
          : cacheAvailable && !noCache
          ? await fetchWithCache({
              queryKey: [datasetId || endpointId, parameters],
              queryFn: () => fetch({ datasetId, endpointId, parameters })
            })
          : await fetch({ datasetId, endpointId, parameters })

      setApiResponse(!!datasetId ? { list: data } : data)

      if (!cacheStore?.[key] || noCache) {
        endpointId ? updateCacheStore(endpointId, data.list) : updateCacheStore(datasetId, data)
      }
      if (typeof setData == 'function') setData(!!datasetId ? { list: data } : data)
      setIsLoading(false)
    }
  }
  let finalItemsList = data ? data : reducer(apiResponse)?.filter?.(filter)
  finalItemsList = cacheStore?.[key] && !noCache ? cacheStore?.[key] : finalItemsList

  finalItemsListRef.current = finalItemsList || []
  const fieldPath = rest?.name?.split('.')
  const [parent, child] = fieldPath
  const name = child || rest?.name

  const _value =
    (typeof values[name] === 'object'
      ? values[name]
      : datasetId
      ? finalItemsList?.find(item => item[valueField] === values[name]?.toString())
      : finalItemsList?.find(item => item[valueField] === (values[name] || values))) ||
    value ||
    ''

  const onBlur = (e, HighlightedOption, options) => {
    finalItemsListRef.current = options || finalItemsListRef.current

    if (HighlightedOption) {
      rest.onChange('', HighlightedOption)
    } else if (finalItemsListRef.current?.[0]) {
      selectFirstOption()
    }
  }

  const selectFirstOption = () => {
    if (finalItemsListRef.current?.[0]) {
      rest.onChange('', finalItemsListRef.current[0])
    }
  }

  return (
    <CustomComboBox
      {...{
        ...rest,
        refresh,
        fetchData,
        name,
        fullName: rest.name,
        store: finalItemsList,
        valueField,
        value: _value,
        onBlur,
        isLoading
      }}
    />
  )
}
