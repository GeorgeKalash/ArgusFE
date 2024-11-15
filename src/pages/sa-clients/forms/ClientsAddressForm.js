import React, { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import AddressForm from 'src/components/Shared/AddressForm'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { useInvalidate } from 'src/hooks/resource'

const ClientsAddressForm = ({ getAddressGridData, clientId, recordId, window, props }) => {
  const [address, setAddress] = useState()
  const [submited, setSubmited] = useState(false)
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  useEffect(() => {
    getAddressGridData(clientId)
  }, [submited])

  const onSubmit = async obj => {
    setSubmited(true)
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
          console.log('Edddddddddddddddddd')
        }
        window.close()
      })
    }
  }

  return <AddressForm {...{ ...props, address, setAddress, recordId: recordId, onSubmit }} />
}

export default ClientsAddressForm
