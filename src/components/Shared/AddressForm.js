// ** MUI Imports

// ** Custom Imports
import { SystemRepository } from 'src/repositories/SystemRepository'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'


const AddressForm = ({
  recordId,
  address,
  setAddress,
  editMode,
  onSubmit
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  function onAddressSubmit(post){

    console.log(post)
     const data = {...post ,  recordId: recordId}
      postRequest({
        extension: SystemRepository.Address.set,
        record: JSON.stringify(data)
      })
        .then(res => {
          data.addressId = res.recordId
          onSubmit(data)
        })

  }
  useEffect(()=>{
    setAddress([])
      if (recordId ) {
        var parameters = `_filter=` + '&_recordId=' + recordId
        getRequest({
          extension: SystemRepository.Address.get,
          parameters: parameters
        })
          .then(res => {
            var result = res.record
            setAddress(result)
          })
          .catch(error => {})
        }
    },[recordId])


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
