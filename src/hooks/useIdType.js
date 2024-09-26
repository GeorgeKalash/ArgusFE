import { useContext, useEffect, useState } from 'react'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { RequestsContext } from 'src/providers/RequestsContext'

export default function useIdType() {
  const [store, setStore] = useState()
  const { getRequest } = useContext(RequestsContext)

  const fillIdTypeStore = () => {
    var parameters = ``
    getRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.qry,
      parameters: parameters
    })
      .then(res => {
        setStore(res.list)
      })
      .catch(error => {
        // setErrorMessage(error);
      })
  }

  useEffect(() => {
    !store && fillIdTypeStore()
  }, [store])

  const getTypeValue = value => {
    function isValidRegex(pattern) {
      try {
        new RegExp(pattern) // Try to create a new RegExp object

        return true // If no error, the pattern is valid
      } catch (e) {
        return false // If an error is thrown, the pattern is invalid
      }
    }
    var formatted = store?.find(item => item.format === value)
    if (!formatted?.recordId) {
      formatted =
        store?.find(item => {
          if (item && item.format && isValidRegex(item.format)) {
            const regex = new RegExp(item.format)
            console.log(regex, value, regex.test(parseInt(value)))

            return regex.test(value)
          }

          return false
        }) ?? ''
    }

    return formatted?.recordId
  }

  return [getTypeValue]
}
