import { useState } from 'react'
import signalRService from '../services/signalR/SignalRService'

const useSignalR = () => {
  const [transactionData, setTransactionData] = useState(null)

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
