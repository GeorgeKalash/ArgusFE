import React, { useContext, useState } from 'react'
import AddressForm from 'src/components/Shared/AddressForm'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { ControlContext } from 'src/providers/ControlContext'

const VendorsAddressForm = ({ getAddressGridData, recordId, vendorId, window, props }) => {
  const [address, setAddress] = useState()
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const onSubmit = async obj => {
    try {
      if (obj) {
        const data = {
          vendorId: vendorId,
          address: obj,
          addressId: obj.recordId
        }
        await postRequest({
          extension: PurchaseRepository.Address.set,
          record: JSON.stringify(data)
        }).then(res => {
          if (!obj.recordId) {
            toast.success(platformLabels.Added)
          } else {
            toast.success(platformLabels.Edited)
          }
          getAddressGridData(vendorId)
        })
        window.close()
      }
    } catch (error) {}
  }

  return <AddressForm {...{ ...props, address, setAddress, recordId, onSubmit }} />
}

export default VendorsAddressForm
