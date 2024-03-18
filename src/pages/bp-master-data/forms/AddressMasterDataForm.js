import { Box } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect, useState } from 'react'

import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import AddressGridTab from 'src/components/Shared/AddressGridTab'
import AddressForm from 'src/pages/plants/Forms/AddressForm'
import { useWindow } from 'src/windows'
import { SystemRepository } from 'src/repositories/SystemRepository'

const AddressMasterDataForm = ({ store, maxAccess, labels , editMode }) => {
  const {recordId} = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [addressGridData, setAddressGridData] = useState([]) //for address tab
  const [address, setAddress] = useState([]) //for address tab

  const { stack } = useWindow()

const onSubmit = obj => {
  console.log(obj)
  const bpId = recordId
  postRequest({
    extension: SystemRepository.Address.set,
    record: JSON.stringify(obj)
  })
    .then(res => {

      obj.recordId = res.recordId

      // addressValidation.setFieldValue('recordId', obj.recordId)
      // setAddressWindowOpen(false)

      //post BPAddress
      const object = obj //we add bill to and ship to to validation
      object.addressId = res.recordId
      object.bpId = recordId
      console.log('object')
      console.log(object)
      postRequest({
        extension: BusinessPartnerRepository.BPAddress.set,
        record: JSON.stringify(object)
      })
        .then(bpResponse => {
          getAddressGridData(bpId)
        })
        .catch(error => {
          // setErrorMessage(error)
        })

      //bill to and ship to are with formik (hidden or not from security grps)
    })
    .catch(error => {
      // setErrorMessage(error)
    })
}

const getAddressGridData = bpId => {
  setAddressGridData([])
  const defaultParams = `_bpId=${bpId}`
  var parameters = defaultParams
  getRequest({
    extension: BusinessPartnerRepository.BPAddress.qry,
    parameters: parameters
  })
    .then(res => {
      console.log('grid')
      console.log(res) //address is complex object so data are not appearing in grid setAddressGridData(res).. should find solution
      res.list = res.list.map(row => (row = row.address)) //sol
      console.log(res)
      setAddressGridData(res)
    })
    .catch(error => {
      // setErrorMessage(error)
    })
}

const delAddress = obj => {
  //talk about problem of getting only address body: create empty object or keep this full body??
  console.log(obj)
  const bpId = recordId
  obj.bpId = bpId
  obj.addressId = obj.recordId
  console.log(obj)
  postRequest({
    extension: BusinessPartnerRepository.BPAddress.del,
    record: JSON.stringify(obj)
  })
    .then(res => {
      toast.success('Record Deleted Successfully')
      getAddressGridData(bpId)
    })
    .catch(error => {
      // setErrorMessage(error)
    })
}

function addAddress (){
openForm('')
}


function openForm(recordId){
  stack({
    Component:  AddressForm,
    props: {
          _labels: labels,
          maxAccess:maxAccess,
          editMode : editMode,
          recordId :  recordId,
          address : address,
          setAddress : setAddress,
          onSubmit: onSubmit
    },
    width: 600,
    height: 600,
    title: labels.address
  })

}

// const addAddress = () => {
//   addressValidation.setValues(getNewAddress) //bpId is then added to object on save..
//   setAddressWindowOpen(true)
// }

const editAddress = obj => {
  openForm(obj.recordId)
}

const getAddressById = obj => {
  const _bpId = recordId

  const defaultParams = `_recordId=${obj.recordId}` //addressId the object i am getting was the bpAddress
  // after modifying list it is normal address so i send obj.recordId
  const bpAddressDefaultParams = `_addressId=${obj.recordId}&_bpId=${_bpId}`
  var parameters = defaultParams
  getRequest({
    extension: SystemRepository.Address.get,
    parameters: parameters
  })
    .then(res => {
      console.log(res.record)
      addressValidation.setValues(populateAddress(res.record))
      setAddressEditMode(true)
      setAddressWindowOpen(true)

      getRequest({
        extension: BusinessPartnerRepository.BPAddress.get,
        parameters: bpAddressDefaultParams
      })
        .then(res => {
          console.log(res.record)

        })
        .catch(error => {
          // setErrorMessage(error)
        })
    })
    .catch(error => {
      // setErrorMessage(error)
    })
}

useEffect(()=>{
  console.log("list")
  getAddressGridData(recordId)
},[recordId])

return (

  <Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  }}
>

  <AddressGridTab
        addressGridData={addressGridData}

        // getAddressGridData={getAddressGridData}
        addAddress={addAddress}
        delAddress={delAddress}
        editAddress={editAddress}
        labels={labels}
        maxAccess={maxAccess}

      />
      </Box>

  )
}

export default AddressMasterDataForm
