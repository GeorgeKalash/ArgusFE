import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import TransactionForm from '../currency-trading/forms/TransactionForm'
import useResourceParams from 'src/hooks/useResourceParams'
import { useError } from 'src/error'
import { ResourceIds } from 'src/resources/ResourceIds'

export default function CurrencyTrading() {
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const [plantId, setPlantId] = useState(null)

  const { labels: _labels, access } = useResourceParams({
    datasetId: ResourceIds.CashInvoice
  })

  const getPlantId = async () => {
    const userData = window.sessionStorage.getItem('userData')
      ? JSON.parse(window.sessionStorage.getItem('userData'))
      : null

    const parameters = `_userId=${userData && userData.userId}&_key=plantId`

    return getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: parameters
    }).then(res => res.record.value)
  }
  async function openForm() {
    const plantId = await getPlantId()
    if (!plantId) {
      stackError({ message: 'The user does not have a default plant' })
    } else {
      setPlantId(plantId)
    }
  }

  useEffect(() => {
    access && openForm()
  }, [access])

  return plantId && access && <TransactionForm labels={_labels} access={access} plantId={plantId} />
}
