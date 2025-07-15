import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect, useState } from 'react'
import AddressGridTab from 'src/components/Shared/AddressGridTab'
import { useWindow } from 'src/windows'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { ControlContext } from 'src/providers/ControlContext'
import AddressForm from 'src/components/Shared/AddressForm'

const VendorsAddressGrid = ({ store, labels, editMode, ...props }) => {
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
    }).then(res => {
      res.list = res.list.map(row => (row = row.address))
      setAddressGridData(res)
    })
  }

  const delAddress = async obj => {
    const vendorId = recordId
    obj.vendorId = vendorId
    obj.addressId = obj.recordId
    await postRequest({
      extension: PurchaseRepository.Address.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    getAddressGridData(vendorId)
  }

  function addAddress() {
    openForm('')
  }

  function openForm(id) {
    stack({
      Component: AddressForm,
      props: {
        recordId: id,
        isCleared: false,
        onSubmit: async (obj, window) => {
          if (obj) {
            const data = {
              vendorId: vendorId,
              address: obj,
              addressId: obj.recordId
            }

            await postRequest({
              extension: PurchaseRepository.Address.set,
              record: JSON.stringify(data)
            })

            toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
            getAddressGridData(recordId)
            window.close()
          }
        }
      }
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
      columns={columns}
      {...props}
    />
  )
}

export default VendorsAddressGrid
