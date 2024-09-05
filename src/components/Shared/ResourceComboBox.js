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
  const { cacheStore = {}, updateStore } = useCacheDataContext() || {}
  const cacheAvailable = !!updateStore
  const { getAllKvsByDataset } = useContext(CommonContext)

  console.log(cacheAvailable)

  const [apiResponse, setStore] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const apiUrl = endpointId || datasetId

  useEffect(() => {
    if (!cacheStore[apiUrl]) fetchData()
  }, [parameters])

  const fetchData = () => {
    if (parameters && !data && (datasetId || endpointId)) {
      setIsLoading(true)
      if (datasetId) {
        getAllKvsByDataset({
          _dataset: datasetId,
          callback: list => {
            if (cacheAvailable) {
              updateStore(datasetId, { list })
            } else {
              setStore({ list })
            }
          }
        })
        setIsLoading(false)
      } else if (endpointId) {
        getRequest({
          extension: endpointId,
          parameters,
          disableLoading: true
        })
          .then(res => {
            let data = res

            setIsLoading(false)
            if (cacheAvailable) updateStore(endpointId, data)
            else setStore(data)
          })
          .catch(error => {})
      }
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
