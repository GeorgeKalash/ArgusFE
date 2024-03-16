import { Box } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect, useState } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import AddressGridTab from 'src/components/Shared/AddressGridTab'

const AddressMasterDataForm = ({ store, maxAccess, labels , editMode }) => {
  const {recordId} = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [addressGridData, setAddressGridData] = useState([]) //for address tab





  const postIdNumber = obj => {

    const postBody = Object.entries(obj).map(([key, value]) => {
      return postRequest({
        extension: BusinessPartnerRepository.MasterIDNum.set,
        record: JSON.stringify(value)
      })
    })
    Promise.all(postBody)
      .then(() => {
        if (!recordId) {
          toast.success('Record Added Successfully')
        } else {
          toast.success('Record Edited Successfully')
        }
      })
      .catch(error => {
      })
  }






const postAddress = obj => {
  console.log(obj)
  const bpId = bpMasterDataValidation.values.recordId
  postRequest({
    extension: SystemRepository.Address.set,
    record: JSON.stringify(obj)
  })
    .then(res => {
      console.log(res.recordId)
      obj.recordId = res.recordId
      addressValidation.setFieldValue('recordId', obj.recordId)
      setAddressWindowOpen(false)

      //post BPAddress
      const object = obj //we add bill to and ship to to validation
      object.addressId = addressValidation.values.recordId
      object.bpId = bpId
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
          setErrorMessage(error)
        })

      //bill to and ship to are with formik (hidden or not from security grps)
    })
    .catch(error => {
      setErrorMessage(error)
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
      setErrorMessage(error)
    })
}

const delAddress = obj => {
  //talk about problem of getting only address body: create empty object or keep this full body??
  console.log(obj)
  const bpId = bpMasterDataValidation.values.recordId
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
      setErrorMessage(error)
    })
}

const addAddress = () => {
  addressValidation.setValues(getNewAddress) //bpId is then added to object on save..
  setAddressWindowOpen(true)
}

const editAddress = obj => {
  console.log(obj)
  getAddressById(obj)
}

const getAddressById = obj => {
  const _bpId = bpMasterDataValidation.values.recordId

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
          setErrorMessage(error)
        })
    })
    .catch(error => {
      setErrorMessage(error)
    })
}

useEffect(()=>{
  console.log("list")
  getAddressGridData(recordId)
},[recordId])

return (

      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
      <AddressGridTab
        addressGridData={addressGridData}
        getAddressGridData={getAddressGridData}
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
