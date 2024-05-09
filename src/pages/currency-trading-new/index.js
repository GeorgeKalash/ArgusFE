import { Box } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'

import { SystemRepository } from 'src/repositories/SystemRepository'
import TransactionForm from '../currency-trading/forms/TransactionForm'
import useResourceParams from 'src/hooks/useResourceParams'
import { useError } from 'src/error'
import { ResourceIds } from 'src/resources/ResourceIds'
import documentType from 'src/lib/docRefBehaivors'

export default function CurrencyTrading() {
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const [plantId, setPlantId] = useState(null)

  const { labels: _labelsADJ, access } = useResourceParams({
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
    })
      .then(res => res.record.value)
      .catch(error => {})
  }
  async function openForm() {
    try {
      const plantId = await getPlantId()
      if (plantId !== '') {
        setPlantId(plantId)
      } else {
        stackError({ message: 'The user does not have a default plant' })
      }
    } catch (error) {}
  }
  async function check() {
    const general = await documentType(getRequest, 'SystemFunction', undefined, false)

    return general
  }
  useEffect(() => {
    const general = check()
    console.log(general)
    !general?.errorMessage ? openForm() : stackError({ message: general?.errorMessage })
    openForm()
  }, [access])

  return (
    <Box sx={{ height: `calc(100vh - 48px)`, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
      {plantId && access && <TransactionForm labels={_labelsADJ} maxAccess={access} plantId={plantId} />}
    </Box>
  )
}
