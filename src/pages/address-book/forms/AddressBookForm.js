import React, { useState } from 'react'
import AddressForm from 'src/components/Shared/AddressForm'

const AddressBookForm = ({ recordId, props }) => {
  const [address, setAddress] = useState()

  return <AddressForm {...{ ...props, address, setAddress, recordId, onSubmit: () => {} }} />
}

export default AddressBookForm
