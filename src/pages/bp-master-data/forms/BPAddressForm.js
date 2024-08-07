import React, { useContext, useState } from 'react'
import AddressForm from 'src/components/Shared/AddressForm'
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'

const BPAddressForm = ({ getAddressGridData, recordId, bpId, window, props }) => {
  const [address, setAddress] = useState()
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const onSubmit = async obj => {
    try {
      if (obj) {
        obj.bpId = bpId
        await postRequest({
          extension: BusinessPartnerRepository.BPAddress.set,
          record: JSON.stringify(obj)
        })

        if (!recordId) {
          toast.success(platformLabels.Added)
        } else {
          toast.success(platformLabels.Edited)
        }
      }
      await getAddressGridData(bpId)
      window.close()
    } catch (error) {}
  }

  return <AddressForm {...{ ...props, address, setAddress, recordId, onSubmit }} />
}

export default BPAddressForm
