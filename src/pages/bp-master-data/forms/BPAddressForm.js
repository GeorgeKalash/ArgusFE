import React, { useContext, useState } from 'react'
import AddressForm from 'src/components/Shared/AddressForm'
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import toast from 'react-hot-toast'

export const BPAddressForm = ({getAddressGridData ,recordId , bpId ,window ,props}) => {
  const [address , setAddress] = useState()
  const {  postRequest } = useContext(RequestsContext)

  const onSubmit =  (obj) => {
    obj.bpId= bpId
   postRequest({
     extension: BusinessPartnerRepository.BPAddress.set,
     record: JSON.stringify(obj)
   }).then(res => {
       if (!recordId)
         toast.success('Record Added Successfully')
        else
       toast.success('Record Edited Successfully')

       getAddressGridData(bpId)
       window.close()
     }).catch(error => {
     })

}

return (
    <AddressForm  {...{ ...props, address, setAddress , recordId, onSubmit}}  />
  )
}
