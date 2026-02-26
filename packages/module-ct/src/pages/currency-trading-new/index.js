import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import TransactionForm from '@argus/shared-ui/src/components/Shared/Forms/TransactionForm'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { useError } from '@argus/shared-providers/src/providers/error'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

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
    }).then(res => res?.record?.value)
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
