import { Box } from '@mui/material'
import toast from 'react-hot-toast'

// ** Custom Imports
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect, useState } from 'react'

import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import AddressGridTab from 'src/components/Shared/AddressGridTab'
import { useWindow } from 'src/windows'
import BPAddressForm from './BPAddressForm'

const AddressMasterDataForm = ({ store, maxAccess, labels , editMode , ...props }) => {
  const {recordId} = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [addressGridData, setAddressGridData] = useState([]) //for address tab
  const { stack } = useWindow()

const getAddressGridData = bpId => {
  setAddressGridData([])
  const defaultParams = `_bpId=${bpId}`
  var parameters = defaultParams
  getRequest({
    extension: BusinessPartnerRepository.BPAddress.qry,
    parameters: parameters
  })
    .then(res => {
      res.list = res.list.map(row => (row = row.address)) //sol
      setAddressGridData(res)
    })
    .catch(error => {

    })
}

const delAddress = obj => {

  const bpId = recordId
  obj.bpId = bpId
  obj.addressId = obj.recordId
  postRequest({
    extension: BusinessPartnerRepository.BPAddress.del,
    record: JSON.stringify(obj)
  })
    .then(res => {
      toast.success('Record Deleted Successfully')
      getAddressGridData(bpId)
    })
    .catch(error => {
    })
}

function addAddress (){
openForm('')
}


function openForm(id){

  stack({
    Component:  BPAddressForm,
    props: {
          _labels: labels,
          maxAccess:maxAccess,
          editMode : editMode,
          recordId :  id,
          bpId: recordId,
          getAddressGridData: getAddressGridData

    },
    width: 600,
    height: 600,
    title: labels.address
  })

}

const editAddress = obj => {
  openForm(obj.recordId)
}

useEffect(()=>{
  recordId && getAddressGridData(recordId)
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
        addAddress={addAddress}
        delAddress={delAddress}
        editAddress={editAddress}
        labels={labels}
        maxAccess={maxAccess}
        {...props}

      />
      </Box>

  )
}

export default AddressMasterDataForm
