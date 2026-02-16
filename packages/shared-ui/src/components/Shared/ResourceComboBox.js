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

  const key = endpointId || datasetId
  const noCache = Boolean(dynamicParams)

  const didTriggerDefaultRef = useRef(false)

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

    !noCache && fetchDataAsync()
  }, [parameters])

  const fetchData = async (refresh = true) => {
    if (rest?.readOnly && dataGrid) return

    if (parameters && !data && (datasetId || endpointId)) {
      setIsLoading(true)

      const data =
        cacheStore?.[key] && !refresh
          ? cacheStore?.[key]
          : cacheAvailable
          ? await fetchWithCache({
              queryKey: [datasetId || endpointId, parameters],
              queryFn: () => fetch({ datasetId, endpointId, parameters, refresh })
            })
          : await fetch({ datasetId, endpointId, parameters, refresh })

      setApiResponse(!!datasetId ? { list: data } : data)

      if (!cacheStore?.[key]) {
        endpointId ? updateCacheStore(endpointId, data.list) : updateCacheStore(datasetId, data)
      }
      if (typeof setData == 'function') setData(!!datasetId ? { list: data } : data)
      setIsLoading(false)
    }
  }
  let finalItemsList = data ? data : reducer(apiResponse)?.filter?.(filter)
  finalItemsList = cacheStore?.[key] && !noCache ? cacheStore?.[key] : finalItemsList

  finalItemsListRef.current = rest?.options || finalItemsList || []
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

  const onBlur = (e, HighlightedOption, options, allowSelect) => {
    if (allowSelect) {
      finalItemsListRef.current = options || finalItemsListRef.current
      if (HighlightedOption) {
        rest.onChange('', HighlightedOption)
      } else if (finalItemsListRef.current?.[0]) {
        selectFirstOption()
      }
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
    if (!triggerOnDefault || !rest.onChange ) return
    if (!_value || typeof _value !== 'object') return

    const matchedValue = datasetId
      ? finalItemsList?.find(item => Number(item.key) === Number(_value))
      : _value

    const shouldUpdate =
      matchedValue &&
      Object.keys(matchedValue).length > 0 &&
      apiResponse?.list?.some(
        item => item[valueField] === matchedValue[valueField]
      )

    if (shouldUpdate) rest.onChange(name, matchedValue)
  }, [_value])


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
        onOpen: () => noCache && fetchData(),
        onBlur,
        isLoading
      }}
    />
  )
}
