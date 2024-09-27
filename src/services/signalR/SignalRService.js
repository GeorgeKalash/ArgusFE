import * as signalR from '@microsoft/signalr'

class SignalRService {
  constructor() {
    this.connection = null
  }

  // Initialize the SignalR connection
  async startConnection() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/transactionHub')
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    try {
      await this.connection.start()
      console.log('SignalR Connected')
    } catch (err) {
      console.error('SignalR Connection Error: ', err)
    }
  }

  // subscribe to ReceiveStatus event
  subscribeToTransactionUpdates(callback) {
    if (this.connection) {
      this.connection.on('ReceiveStatus', status => {
        callback(status)
      })
    }
  }

  // this is used to unsubscribe from the event when the component is unmounted
  unsubscribeFromTransactionUpdates() {
    if (this.connection) {
      this.connection.off('ReceiveStatus')
    }
  }

  async invokeTransactionStart(transactionData) {
    if (this.connection) {
      try {
        await this.connection.invoke('Start_Send', transactionData)
      } catch (err) {
        console.error('Error invoking StartTransaction: ', err)
      }
    }
  }

  stopConnection() {
    if (this.connection) {
      this.connection.stop()
    }
  }
}

const signalRService = new SignalRService()

export default signalRService
