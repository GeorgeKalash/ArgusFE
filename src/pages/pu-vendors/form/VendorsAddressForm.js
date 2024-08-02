import React, { useContext, useState } from 'react'
import AddressForm from 'src/components/Shared/AddressForm'
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import toast from 'react-hot-toast'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'

const VendorsAddressForm = ({ getAddressGridData, recordId, vendorId, window, props }) => {
  const [address, setAddress] = useState()
  const { postRequest } = useContext(RequestsContext)

  const onSubmit = async obj => {
    try {
      const data = {
        vendorId: vendorId,
        address: obj,
        addressId: obj.recordId
      }
      await postRequest({
        extension: PurchaseRepository.Address.set,
        record: JSON.stringify(data)
      })

      if (!obj.recordId) {
        toast.success('Record Added Successfully')
      } else {
        toast.success('Record Edited Successfully')
      }

      getAddressGridData(vendorId)
      window.close()
    } catch (error) {}
  }

  return <AddressForm {...{ ...props, address, setAddress, recordId, onSubmit }} />
}

export default VendorsAddressForm
