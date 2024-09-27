import { useState } from 'react'
import signalRService from '../services/signalR/SignalRService'

const useSignalR = () => {
  const [transactionData, setTransactionData] = useState({
    msgId: '',
    ecrno: '',
    ecR_RCPT: '',
    amount: '',
    a1: '',
    a2: '',
    a3: '',
    a4: '',
    a5: '',
    ipaddressOrPort: '',
    log: 0
  })

  const startConnection = async () => {
    await signalRService.startConnection()
    signalRService.subscribeToTransactionUpdates(data => {
      setTransactionData(data)
    })
  }

  const stopConnection = () => {
    signalRService.unsubscribeFromTransactionUpdates()
    signalRService.stopConnection()
  }

  return {
    transactionData,
    startConnection,
    stopConnection
  }
}

export default useSignalR
