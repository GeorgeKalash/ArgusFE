import React, { useContext, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import AddressForm from 'src/components/Shared/AddressForm'
import { SaleRepository } from 'src/repositories/SaleRepository'

const ClientsAddressForm = ({ getAddressGridData, recordId, window, props, store, setStore }) => {
  const [address, setAddress] = useState()
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [isDefaultShip, setIsDefaultShip] = useState(false)
  const [isDefaultBill, setIsDefaultBill] = useState(false)

  const onSubmit = async obj => {
    if (obj) {
      const data = {
        clientId: store.recordId,
        address: obj,
        addressId: obj.recordId
      }

      await postRequest({
        extension: SaleRepository.Address.set,
        record: JSON.stringify(data)
      }).then(res => {
        if (!obj.recordId) {
          toast.success(platformLabels.Added)
        } else {
          toast.success(platformLabels.Edited)
        }
        window.close()
      })
    }
    getAddressGridData(store.recordId)
  }

  async function setDefaultBilling() {
    const latestRecord = await getLatestClientData()
    await postRequest({
      extension: SaleRepository.Client.set,
      record: JSON.stringify({
        ...latestRecord,
        billAddressId: recordId
      })
    })

    setStore(prevStore => ({
      ...prevStore,
      record: { ...latestRecord, billAddressId: recordId }
    }))
    setIsDefaultBill(true)
    toast.success(platformLabels.Updated)
  }

  async function setDefaultShipping() {
    const latestRecord = await getLatestClientData()
    await postRequest({
      extension: SaleRepository.Client.set,
      record: JSON.stringify({
        ...latestRecord,
        shipAddressId: recordId
      })
    })

    setStore(prevStore => ({
      ...prevStore,
      record: { ...latestRecord, shipAddressId: recordId }
    }))
    setIsDefaultShip(true)
    toast.success(platformLabels.Updated)
  }

  async function getLatestClientData() {
    const response = await getRequest({
      extension: SaleRepository.Client.get,
      parameters: `_recordId=${store.recordId}`
    })

    return response.record
  }

  const actions = [
    {
      key: 'DefaultBilling',
      condition: true,
      onClick: setDefaultBilling,
      disabled: !recordId || store.record.billAddressId == recordId || isDefaultBill
    },
    {
      key: 'DefaultShipping',
      condition: true,
      onClick: setDefaultShipping,
      disabled: !recordId || store.record.shipAddressId == recordId || isDefaultShip
    }
  ]

  return <AddressForm {...{ ...props, address, setAddress, recordId: recordId, onSubmit, actions }} />
}

export default ClientsAddressForm
