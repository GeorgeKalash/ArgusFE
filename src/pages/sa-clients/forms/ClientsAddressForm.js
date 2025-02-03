import React, { useContext, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import AddressForm from 'src/components/Shared/AddressForm'
import { SaleRepository } from 'src/repositories/SaleRepository'

const ClientsAddressForm = ({ getAddressGridData, addressId, window, props, store, setStore }) => {
  const [address, setAddress] = useState()
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [isDefaultShip, setIsDefaultShip] = useState(store?.record?.shipAddressId == recordId)
  const [isDefaultBill, setIsDefaultBill] = useState(store?.record?.billAddressId == recordId)
  const clientId = store.recordId

  const onSubmit = async obj => {
    if (obj) {
      const data = {
        clientId: clientId,
        address: obj,
        addressId: obj.recordId
      }

      await postRequest({
        extension: SaleRepository.Address.set,
        record: JSON.stringify(data)
      })
      if (!obj.recordId) {
        toast.success(platformLabels.Added)
      } else {
        toast.success(platformLabels.Edited)
      }
      window.close()
    }
    getAddressGridData(clientId)
  }

  async function setDefaultBilling() {
    const latestRecord = await getLatestClientData()
    await postRequest({
      extension: SaleRepository.Client.set,
      record: JSON.stringify({
        ...latestRecord,
        billAddressId: addressId
      })
    })

    setStore(prevStore => ({
      ...prevStore,
      record: { ...latestRecord, billAddressId: addressId }
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
        shipAddressId: addressId
      })
    })

    setStore(prevStore => ({
      ...prevStore,
      record: { ...latestRecord, shipAddressId: addressId }
    }))
    setIsDefaultShip(true)
    toast.success(platformLabels.Updated)
  }

  async function getLatestClientData() {
    const response = await getRequest({
      extension: SaleRepository.Client.get,
      parameters: `_recordId=${clientId}`
    })

    return response.record
  }

  const actions = [
    {
      key: 'DefaultBilling',
      condition: true,
      onClick: setDefaultBilling,
      disabled: !addressId || isDefaultBill
    },
    {
      key: 'DefaultShipping',
      condition: true,
      onClick: setDefaultShipping,
      disabled: !addressId || isDefaultShip
    }
  ]

  return <AddressForm {...{ ...props, address, setAddress, recordId: addressId, onSubmit, actions }} />
}

export default ClientsAddressForm
