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
  setData,
  ...rest
}) {
  const { store: data } = rest

  const { getRequest } = useContext(RequestsContext)
  const { updateStore, fetchWithCache } = useCacheDataContext() || {}
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

  const [apiResponse, setApiResponse] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchDataAsync = async () => {
      await fetchData()
    }

    fetchDataAsync()
  }, [parameters])

  const fetchData = async () => {
    if (parameters && !data && (datasetId || endpointId)) {
      setIsLoading(true)

      const data = cacheAvailable
        ? await fetchWithCache({
            queryKey: [datasetId || endpointId, parameters],
            queryFn: () => fetch({ datasetId, endpointId, parameters })
          })
        : await fetch({ datasetId, endpointId, parameters })
      setApiResponse(!!datasetId ? { list: data } : data)
      if (typeof setData == 'function') setData(!!datasetId ? { list: data } : data)
      setIsLoading(false)
    }
  }

  let finalItemsList = data ? data : reducer(apiResponse)?.filter?.(filter)

  const _value =
    (typeof values[name] === 'object'
      ? values[name]
      : datasetId
      ? finalItemsList?.find(item => item[valueField] === values[name]?.toString())
      : finalItemsList?.find(item => item[valueField] === (values[name] || values))) ||
    value ||
    ''

  return (
    <CustomComboBox
      {...{
        ...rest,
        refresh,
        fetchData,
        name,
        store: finalItemsList,
        valueField,
        value: _value,
        isLoading
      }}
    />
  )
}
