import { SystemRepository } from 'src/repositories/SystemRepository'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import useSetWindow from 'src/hooks/useSetWindow'

const AddressForm = ({
  recordId,
  editMode,
  onSubmit,
  window,
  actions = [],
  address: propAddress,
  setAddress: setPropAddress,
  required = true,
  ...props
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [localAddress, setLocalAddress] = useState()
  const isControlled = !!propAddress && !!setPropAddress
  const address = isControlled ? propAddress : localAddress
  const setAddress = isControlled ? setPropAddress : setLocalAddress

  useSetWindow({ title: platformLabels.Address, window })

  function onAddressSubmit(post) {
    if (required) {
      const data = { ...post, recordId: recordId }

      postRequest({
        extension: SystemRepository.Address.set,
        record: JSON.stringify(data)
      }).then(res => {
        data.addressId = res.recordId

        if (recordId) {
          toast.success(platformLabels.Edited)
          onSubmit(null, window)
        } else {
          onSubmit(data, window)
        }
      })
    } else {
      setAddress(post)
      onSubmit(post, window)
    }
  }

  useEffect(() => {
    if (!isControlled && recordId) {
      ;(async () => {
        const res = await getRequest({
          extension: SystemRepository.Address.get,
          parameters: `_filter=&_recordId=${recordId}`
        })
        setLocalAddress(res.record)
      })()
    }
  }, [recordId, isControlled])

  return (
    <AddressFormShell
      editMode={editMode}
      setAddress={setAddress}
      address={address}
      onSubmit={onAddressSubmit}
      actions={actions}
      window={window}
      {...props}
    />
  )
}

AddressForm.width = 600
AddressForm.height = 500

export default AddressForm
