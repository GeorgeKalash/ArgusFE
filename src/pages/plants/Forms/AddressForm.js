// ** MUI Imports

// ** Custom Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'


const AddressForm = ({
  recordId,
  address,
  setStore,
  editMode,
  onSubmit
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  function onAddressSubmit(post){
     const data = {...post ,  recordId: recordId}
      postRequest({
        extension: SystemRepository.Address.set,
        record: JSON.stringify(data)
      })
        .then(res => {
          onSubmit(res)
        })

  }

  useEffect(()=>{
    console.log(recordId)
    var parameters = `_filter=` + '&_recordId=' + recordId
      if (recordId) {
        getRequest({
          extension: SystemRepository.Address.get,
          parameters: parameters
        })
          .then(res => {
            var result = res.record

            setStore(prevStore => ({
              ...prevStore,
              address: result
            }));
            setAddress(result)
          })
          .catch(error => {})
        }
    },[recordId])

   function setAddress(res){
    console.log(res)
    setStore(prevStore => ({
      ...prevStore,
      address: res
    }));
   }

return (
  <>
  <AddressFormShell
     editMode={editMode}
     setAddress={setAddress}
     address={address}
     allowPost={true}
     onSubmit={onAddressSubmit}
    />
    </>
  )
}

export default AddressForm
