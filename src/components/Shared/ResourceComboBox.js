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
  refresh,
  ...rest
}) {
  const { store: data } = rest

  const { getRequest } = useContext(RequestsContext)
  const { cacheStore = {}, updateStore = () => {} } = useCacheDataContext() || {}
  const { getAllKvsByDataset } = useContext(CommonContext)

  const [store, setStore] = useState([])
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
            if (dataGrid) {
              updateStore(datasetId, list)
            } else {
              setStore(list)
            }
          }
        })
        setIsLoading(false)
      } else
        endpointId &&
          getRequest({
            extension: endpointId,
            parameters,
            disableLoading: true
          }).then(res => {
            setIsLoading(false)
            if (dataGrid) updateStore(endpointId, res.list)
            else setStore(res.list)
          })
    }
  }

  const filteredStore = data ? data : dataGrid ? cacheStore[apiUrl]?.filter?.(filter) : store?.filter?.(filter)

  const _value =
    (typeof values[name] === 'object'
      ? values[name]
      : (datasetId
          ? filteredStore?.find(item => item[valueField] === values[name]?.toString())
          : filteredStore?.find(item => item[valueField] === (values[name] || values))) ?? '') || value

  return (
    <CustomComboBox
      {...{
        ...rest,
        refresh,
        fetchData,
        name,
        store: (dataGrid ? cacheStore[apiUrl] : filteredStore) || data,
        valueField,
        value: _value,
        name,
        isLoading
      }}
    />
  )
}
