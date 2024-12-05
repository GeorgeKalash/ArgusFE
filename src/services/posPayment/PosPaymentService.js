import * as signalR from '@microsoft/signalr'
import axios from 'axios'

class PosPaymentService {
  deviceConnected = false
  constructor() {
    this.connection = null
    this.baseUrl = 'http://localhost:5140'
  }

  async startPayment(paymentData, callback) {
    if (!this.deviceConnected) return
    console.log('start payment')
    await this.startConnection()
    this.subscribeToTransactionUpdates(callback)
    this.invokeTransactionStart(paymentData)
  }

  async cancelPayment() {
    try {
      await axios.get(`${this.baseUrl}/api/Ingenico/sendCancel`)
      console.log('Transaction cancelled')
    } catch (error) {
      console.error('Error cancelling transaction:', error)
    } finally {
      this.resolvePamyent()
    }
  }

  resolvePamyent() {
    this.unsubscribeFromTransactionUpdates()
    this.stopConnection()
  }

  async isDeviceOnline() {
    this.deviceConnected = true

    return true
    try {
      const { data } = await axios.get(`${this.baseUrl}/api/Ingenico/checkDevice?_port=1`)
      this.deviceConnected = data.data
    } catch (error) {
      this.deviceConnected = false
      console.error('Error checking device:', error)
    }

    return this.deviceConnected
  }

  async startConnection() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/POSHub`)
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

  subscribeToTransactionUpdates(callback) {
    if (this.connection) {
      this.connection.on('ReceiveStatus', status => {
        callback(status)
      })
    }
  }

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

  async stopConnection() {
    if (this.connection) {
      try {
        this.connection.stop()
        console.log('Connection closed')
      } catch (err) {
        console.log('Error invoking Stop_Connection', err)
      }
    }
  }
}

const posPaymentService = new PosPaymentService()

export default posPaymentService
