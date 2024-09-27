import { useState } from 'react'
import signalRService from '../services/signalR/SignalRService'

const useSignalR = () => {
  const startConnection = async () => {
    await signalRService.startConnection()
  }

  const stopConnection = () => {
    signalRService.unsubscribeFromTransactionUpdates()
    signalRService.stopConnection()
  }

  return {
    startConnection,
    stopConnection
  }
}

export default useSignalR
