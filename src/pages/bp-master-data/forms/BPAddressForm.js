import React, { useState } from 'react'
import AddressForm from 'src/components/Shared/AddressForm'

export const BPAddressForm = (props) => {
  const [address , setAddress] = useState()

return (
    <AddressForm  {...{ ...props, address, setAddress }}  />
  )
}
