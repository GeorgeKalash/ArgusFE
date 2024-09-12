import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CommonContext } from 'src/providers/CommonContext'
import { useCacheDataContext } from 'src/providers/CacheDataContext'

export default function ResourceComboBox({
  endpointId,
  datasetId,
  name,
  valueField = 'recordId',
  values = {},
  parameters = '_filter=',
  filter = () => true,
  dataGrid,
  value,
  reducer = res => res?.list,
  refresh,
  ...rest
}) {
  const { store: data } = rest

  const { getRequest } = useContext(RequestsContext)
  const { cacheStore = {}, updateStore, fetchWithCache } = useCacheDataContext() || {}
  const cacheAvailable = !!updateStore
  const { getAllKvsByDataset } = useContext(CommonContext)
  function fetch({ datasetId, endpointId, parameters }) {
    if (endpointId) {
      return getRequest({
        extension: endpointId,
        parameters,
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

  console.log(cacheAvailable)

  const [apiResponse, setStore] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const apiUrl = endpointId || datasetId

  useEffect(() => {
    if (!cacheStore[apiUrl]) fetchData()
  }, [parameters])

  const fetchData = async () => {
    if (parameters && !data && (datasetId || endpointId)) {
      setIsLoading(true)
      if (cacheAvailable) {
        await fetchWithCache({
          queryKey: [datasetId || endpointId, parameters],
          queryFn: () => fetch({ datasetId, endpointId, parameters })
        })
      } else {
        const newRes = await fetch({ datasetId, endpointId, parameters })
        setStore(!!datasetId ? { list: newRes } : newRes)
      }
      setIsLoading(false)
    }
  }
  const store = apiResponse ? reducer(apiResponse) : null
  let filteredStore = []
  try {
    filteredStore = data
      ? data
      : cacheAvailable
      ? reducer(cacheStore[apiUrl])?.filter?.(filter)
      : store?.filter?.(filter)
  } catch (error) {
    console.error(error)
  }

  const _value =
    (typeof values[name] === 'object'
      ? values[name]
      : datasetId
      ? filteredStore?.find(item => item[valueField] === values[name]?.toString())
      : filteredStore?.find(item => item[valueField] === (values[name] || values))) ||
    value ||
    ''

  return (
    <CustomComboBox
      {...{
        ...rest,
        refresh,
        fetchData,
        name,
        store: (cacheAvailable ? reducer(cacheStore[apiUrl]) : filteredStore) || data,
        valueField,
        value: _value,
        isLoading
      }}
    />
  )
}
