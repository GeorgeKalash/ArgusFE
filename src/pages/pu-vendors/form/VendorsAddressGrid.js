import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect, useState } from 'react'
import AddressGridTab from 'src/components/Shared/AddressGridTab'
import { useWindow } from 'src/windows'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import VendorsAddressForm from './VendorsAddressForm'
import { ControlContext } from 'src/providers/ControlContext'

const VendorsAddressGrid = ({ store, maxAccess, labels, editMode, ...props }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [addressGridData, setAddressGridData] = useState([])
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const getAddressGridData = vendorId => {
    setAddressGridData([])

    const defaultParams = `_vendorId=${vendorId}`
    var parameters = defaultParams

    getRequest({
      extension: PurchaseRepository.Address.qry,
      parameters: parameters
    })
      .then(res => {
        res.list = res.list.map(row => (row = row.address)) //sol
        setAddressGridData(res)
      })
      .catch(error => {})
  }

  const delAddress = obj => {
    const vendorId = recordId
    obj.vendorId = vendorId
    obj.addressId = obj.recordId
    postRequest({
      extension: PurchaseRepository.Address.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success(platformLabels.Deleted)
        getAddressGridData(vendorId)
      })
      .catch(error => {})
  }

  function addAddress() {
    openForm('')
  }

  function openForm(id) {
    stack({
      Component: VendorsAddressForm,
      props: {
        _labels: labels,
        maxAccess,
        editMode,
        recordId: id,
        vendorId: recordId,
        getAddressGridData: getAddressGridData
      },
      width: 600,
      height: 500,
      title: labels.address
    })
  }

  const editAddress = obj => {
    openForm(obj.recordId)
  }

  useEffect(() => {
    recordId && getAddressGridData(recordId)
  }, [recordId])

  const columns = [
    {
      field: 'city',
      headerName: labels.city,
      flex: 1
    },
    {
      field: 'street1',
      headerName: labels.street1,
      flex: 1
    }
  ]

  return (
    <AddressGridTab
      addressGridData={addressGridData}
      addAddress={addAddress}
      delAddress={delAddress}
      editAddress={editAddress}
      labels={labels}
      columns={columns}
      maxAccess={maxAccess}
      {...props}
    />
  )
}

export default VendorsAddressGrid
