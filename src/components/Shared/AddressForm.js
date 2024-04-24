import { SystemRepository } from 'src/repositories/SystemRepository'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'

const AddressForm = ({ recordId, address, setAddress, editMode, onSubmit }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  function onAddressSubmit(post) {
    const data = { ...post, recordId: recordId }
    postRequest({
      extension: SystemRepository.Address.set,
      record: JSON.stringify(data)
    }).then(res => {
      data.addressId = res.recordId
      onSubmit(data)
      if (res.recordId) toast.success('Record Updated Successfully')
    })
  }
  useEffect(() => {
    ;(async function () {
      setAddress([])
      if (recordId) {
        const res = await getRequest({
          extension: SystemRepository.Address.get,
          parameters: `_filter=` + '&_recordId=' + recordId
        })
        setAddress(res.record)
      }
    })
  }, [recordId])

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
