import { SystemRepository } from 'src/repositories/SystemRepository'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'

const AddressForm = ({ recordId, address, setAddress = () => {}, editMode, onSubmit, isCleared = true }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  function onAddressSubmit(post) {
    const data = { ...post, recordId: recordId }
    postRequest({
      extension: SystemRepository.Address.set,
      record: JSON.stringify(data)
    }).then(res => {
      data.addressId = res.recordId
      if (recordId) {
        toast.success(platformLabels.Edited)
        onSubmit()
      } else onSubmit(data)
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        try {
          const res = await getRequest({
            extension: SystemRepository.Address.get,
            parameters: `_filter=` + '&_recordId=' + recordId
          })
          setAddress(res.record)
        } catch (error) {}
      }
    })()
  }, [recordId])

  return (
    <AddressFormShell
      editMode={editMode}
      setAddress={setAddress}
      address={address}
      allowPost={true}
      onSubmit={onAddressSubmit}
      isCleared ={isCleared}
    />
  )
}

export default AddressForm
