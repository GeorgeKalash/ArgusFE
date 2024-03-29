import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { CommonContext } from 'src/providers/CommonContext'

export default function ResourceComboBox({
  endpointId,
  datasetId,
  name,
  valueField = 'recordId',
  values = {},
  parameters = '_filter=',
  filter = () => true,
  ...rest
}) {
  const {store : data} = rest
  const { getRequest } = useContext(RequestsContext)

  const { getAllKvsByDataset } = useContext(CommonContext)

  const [store, setStore] = useState([])

  useEffect(() => {
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
            parameters
          }).then(res => {
            setStore(res.list)
          })
  }, [parameters])

  const filteredStore =  data ? data : store.filter(filter)

  const value =
    typeof values[name] === 'object'
      ? values[name]
      : (datasetId
          ? filteredStore.find(item => item[valueField] === values[name]?.toString())
          : filteredStore.find(item => item[valueField] === values[name])) ?? ''

  return <CustomComboBox {...{ ...rest, name, store: filteredStore, valueField, value, name }} />
}
