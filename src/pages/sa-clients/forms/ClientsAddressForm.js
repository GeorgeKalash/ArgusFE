import React, { useContext, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import AddressForm from 'src/components/Shared/AddressForm'
import { SaleRepository } from 'src/repositories/SaleRepository'

const ClientsAddressForm = ({ getAddressGridData, clientId, recordId, window, props }) => {
  const [address, setAddress] = useState()
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

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
      }).then(res => {
        if (!obj.recordId) {
          toast.success(platformLabels.Added)
        } else {
          toast.success(platformLabels.Edited)
        }
        window.close()
      })
    }
    getAddressGridData(clientId)
  }

  return <AddressForm {...{ ...props, address, setAddress, recordId: recordId, onSubmit }} />
}

export default ClientsAddressForm
