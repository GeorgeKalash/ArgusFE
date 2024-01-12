import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

export default function ResourceComboBox({ endpointId, name, valueField, values, parameters = '_filter=', filter = () => true, ...rest  }) {
  const { getRequest } = useContext(RequestsContext)

  const [store, setStore] = useState([])

  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    if(parameters)
    getRequest({
      extension: endpointId,
      parameters
    })
      .then(res => {
        setStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }, [parameters])

  const filteredStore = store.filter(filter);

  const value = filteredStore.find(item => item[valueField] === values[name]) ?? ''

  return (
    <>
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
      <CustomComboBox {...{ name, store: filteredStore, valueField, value, ...rest }} />
    </>
  )
}
