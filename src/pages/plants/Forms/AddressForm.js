// ** MUI Imports

// ** Custom Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'


const AddressForm = ({
  editMode,
  recordId
}) => {

  const [address , setAddress] = useState([])
  const [post , setPost] = useState(false)

  const { getRequest, postRequest } = useContext(RequestsContext)

  useEffect(()=>{
    console.log(address)

    if(post && post.cityId){
      postRequest({
        extension: SystemRepository.Address.set,
        record: JSON.stringify(address)
      })
        .then(res => {
          postPlant(res.recordId)
          toast.success('Record Added Successfully')
        })
}
  },[post])

 async function postPlant (addressId){

    const res = await getPlantAddress()
    console.log(res.record)
    if(res.record){
    const data ={...res.record, address: addressId , recordId: recordId}
     await  postRequest({
      extension: SystemRepository.Plant.set,
      record: JSON.stringify(data)
    })
      .then(res => {

        if (recordId) {
          toast.success('Record Added Successfully')

        //   setEditMode(true)
        //   setRecordId(res.recordId)
        }

        // else toast.success('Record Edited Successfully')
      })
      .catch(error => {
      })}
  }

  const getPlantAddress =  () => {
    //always gives value?
    const defaultParams = `_recordId=${recordId}`
    var parameters = defaultParams

      return  getRequest({
      extension: SystemRepository.Plant.get,
      parameters: parameters
    })

  }
  useEffect(()=>{
    var parameters = `_filter=` + '&_recordId=' + recordId
      if (recordId) {
        getRequest({
          extension: SystemRepository.Address.get,
          parameters: parameters
        })
          .then(res => {
            var result = res.record
            console.log("result" + result)
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
    setPost={setPost}
    />
    </>
  )
}

export default AddressForm
