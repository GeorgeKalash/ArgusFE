import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CommonContext } from 'src/providers/CommonContext'

export default function ResourceComboBox({
  endpointId,
  datasetId,
  name,
  valueField = 'recordId',
  values = {},
  parameters = '_filter=',
  filter = () => true,
  gridStore,
  setAbroadStore,
  value,
  ...rest
}) {
  const { store: data } = rest
  const { getRequest } = useContext(RequestsContext)

  const { getAllKvsByDataset } = useContext(CommonContext)

  const [store, setStore] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const isAboardStore = typeof setAbroadStore === 'function' ? true : false

  useEffect(() => {
    if (parameters && !gridStore) {
      setIsLoading(true)
      if (datasetId) {
        getAllKvsByDataset({
          _dataset: datasetId,
          callback: isAboardStore ? setAbroadStore : setStore
        })
        setIsLoading(false)
      } else
        endpointId &&
          getRequest({
            extension: endpointId,
            parameters,
            disableLoading: true
          })
            .then(res => {
              setIsLoading(false)
              if (isAboardStore) setAbroadStore(res.list)
              else setStore(res.list)
            })
            .catch(error => {})
    }
  }, [parameters])

  const filteredStore = data ? data : store?.filter?.(filter) || []

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
        name,
        store: isAboardStore ? gridStore : store,
        valueField,
        value: _value,
        name,
        isLoading
      }}
    />
  )
}
