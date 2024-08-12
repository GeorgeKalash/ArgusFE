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
  value,

  ...rest
}) {
  const { store: data } = rest
  const { getRequest } = useContext(RequestsContext)

  const { getAllKvsByDataset } = useContext(CommonContext)

  const [store, setStore] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    if (parameters)
      if (datasetId)
        getAllKvsByDataset({
          _dataset: datasetId,
          callback: setStore
        })
      else
        endpointId &&
          getRequest({
            extension: endpointId,
            parameters,
            disableLoading: true
          })
            .then(res => {
              setIsLoading(false)
              setStore(res.list)
            })
            .catch(error => {})
  }, [parameters])

  const filteredStore = data ? data : store.filter(filter)

  const _value =
    (typeof values[name] === 'object'
      ? values[name]
      : (datasetId
          ? filteredStore.find(item => item[valueField] === values[name]?.toString())
          : filteredStore.find(item => item[valueField] === (values[name] || values))) ?? '') || value

  return <CustomComboBox {...{ ...rest, name, store: filteredStore, valueField, value: _value, name, isLoading }} />
}
