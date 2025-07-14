import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect, useState } from 'react'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import AddressGridTab from 'src/components/Shared/AddressGridTab'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import AddressForm from 'src/components/Shared/AddressForm'

const AddressMasterDataForm = ({ store, editMode, ...props }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [addressGridData, setAddressGridData] = useState([])
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const getAddressGridData = bpId => {
    setAddressGridData([])
    const defaultParams = `_bpId=${bpId}`
    var parameters = defaultParams
    getRequest({
      extension: BusinessPartnerRepository.BPAddress.qry,
      parameters: parameters
    }).then(res => {
      res.list = res.list.map(row => (row = row.address))
      setAddressGridData(res)
    })
  }

  const delAddress = obj => {
    const bpId = recordId
    obj.bpId = bpId
    obj.addressId = obj.recordId
    postRequest({
      extension: BusinessPartnerRepository.BPAddress.del,
      record: JSON.stringify(obj)
    }).then(res => {
      toast.success(platformLabels.Deleted)

      getAddressGridData(bpId)
    })
  }

  function addAddress() {
    openForm()
  }

  async function openForm(addressId) {
    stack({
      Component: AddressForm,
      props: {
        recordId: addressId,
        editMode,
        changeClear: true,
        onSubmit: async obj => {
          if ((obj, window)) {
            obj.bpId = recordId
            await postRequest({
              extension: BusinessPartnerRepository.BPAddress.set,
              record: JSON.stringify(obj)
            })

            toast.success(!addressId ? platformLabels.Added : platformLabels.Edited)
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

  return (
    <AddressGridTab
      addressGridData={addressGridData}
      addAddress={addAddress}
      delAddress={delAddress}
      editAddress={editAddress}
      {...props}
    />
  )
}

export default AddressMasterDataForm
