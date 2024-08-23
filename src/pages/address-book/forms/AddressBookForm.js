import React, { useState } from 'react'
import AddressForm from 'src/components/Shared/AddressForm'

const AddressBookForm = ({ recordId, props, invalidate }) => {
  const [address, setAddress] = useState()

  const onSubmit = async () => {
    invalidate()
  }

  return <AddressForm {...{ ...props, address, setAddress, recordId, onSubmit }} />
}

export default AddressBookForm
