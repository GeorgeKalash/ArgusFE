import CustomComboBox from '@argus/shared-ui/src/components/Inputs/CustomComboBox'
import { useContext, useEffect, useState, useRef } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { CommonContext } from '@argus/shared-providers/src/providers/CommonContext'
import { useCacheDataContext } from '@argus/shared-providers/src/providers/CacheDataContext'
import { useCacheStoreContext } from '@argus/shared-providers/src/providers/CacheStoreContext'

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
  defaultIndex,
  reducer = res => res?.list,
  refresh,
  allowClear,
  setData,
  triggerOnDefault = false,
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

  const didTriggerDefaultRef = useRef(false)

  const key = endpointId || datasetId
  const noCache = Boolean(dynamicParams)
  const hasStore = Object.prototype.hasOwnProperty.call(rest, 'store')

  function fetch({ datasetId, endpointId, parameters, refresh }) {
    if (endpointId) {
      const fullParameters = dynamicParams ? parameters + '&' + dynamicParams : parameters

      return getRequest({
        extension: endpointId,
        parameters: fullParameters,
        disableLoading: refresh
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

    if (!hasStore && !noCache && (datasetId || endpointId)) fetchDataAsync()
  }, [parameters, hasStore, datasetId, endpointId, noCache])

  const fetchData = async (isRefresh = false) => {
    if (rest?.readOnly && dataGrid) return
    if (!parameters || (!datasetId && !endpointId)) return
    if (!isRefresh && (hasStore || cacheStore?.[key])) return

    setIsLoading(true)

    const response = cacheAvailable
      ? await fetchWithCache({
          queryKey: [datasetId || endpointId, parameters],
          queryFn: () => fetch({ datasetId, endpointId, parameters, refresh: isRefresh })
        })
      : await fetch({ datasetId, endpointId, parameters, refresh: isRefresh
        })

    const result = datasetId ? { list: response } : response
    setApiResponse(result)

    if (endpointId) updateCacheStore(endpointId, response?.list)
    else if (datasetId) updateCacheStore(datasetId, response)
    if (typeof setData === 'function') setData(result)
    setIsLoading(false)
  }

  let finalItemsList
  if (apiResponse) finalItemsList = reducer(apiResponse)?.filter?.(filter) || []
  else if (data) finalItemsList = data
  else finalItemsList = []

  if (cacheStore?.[key] && !noCache) finalItemsList = cacheStore[key]
  finalItemsListRef.current = rest?.options || finalItemsList || []
  const fieldPath = rest?.name?.split('.')
  const [parent, child] = fieldPath
  const name = child || rest?.name

  const _value =
    (typeof values[name] === 'object'
      ? values[name]
      : finalItemsList?.find(
          item => item[valueField]?.toString() === (values[name] ?? values)?.toString()
        )) ||
    value ||
    ''

  const onBlur = (e, HighlightedOption, options, allowSelect) => {
    if (!allowSelect) return

    finalItemsListRef.current = options || finalItemsListRef.current
    if (HighlightedOption) {
      rest.onChange('', HighlightedOption)
    } else if (!_value && finalItemsListRef.current?.[0]) {
      selectFirstOption()
    }
  }

  const selectFirstOption = () => {
    if (finalItemsListRef.current?.[0]) {
      rest.onChange('', finalItemsListRef.current[0])
    }
  }

  useEffect(() => {
    if (finalItemsListRef.current.length > 0 && typeof defaultIndex === 'number') {
      rest.onChange('', finalItemsListRef.current[defaultIndex])
    }
  }, [defaultIndex, finalItemsListRef.current.length])

  useEffect(() => {
    if (!triggerOnDefault || didTriggerDefaultRef.current) return

    const hasPrimitiveDefault = typeof values[name] !== 'object' && (values[name] || values) && !value
    if (!hasPrimitiveDefault) return

    if (_value && typeof _value === 'object' && _value[valueField]) {
      didTriggerDefaultRef.current = true
      rest.onChange('', _value)
    }
  }, [_value, triggerOnDefault])

  return (
    <CustomComboBox
      {...{
        ...rest,
        refresh,
        allowClear,
        fetchData,
        name,
        fullName: rest.name,
        store: finalItemsList,
        valueField,
        value: _value,
        onOpen: () => noCache && fetchData(true),
        onBlur,
        isLoading
      }}
    />
  )
}
