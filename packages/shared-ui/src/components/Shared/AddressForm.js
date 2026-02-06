import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { AddressFormShell } from '@argus/shared-ui/src/components/Shared/AddressFormShell'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const AddressForm = ({
  recordId,
  editMode,
  onSubmit = () => {},
  window,
  actions = [],
  address: controlledAddress,
  setAddress: setControlledAddress,
  required = true,
  ...props
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const [currentRecordId, setCurrentRecordId] = useState(recordId || null)
  const [localAddress, setLocalAddress] = useState(null)
  const isControlled = !!controlledAddress && !!setControlledAddress

  const address = isControlled ? controlledAddress : localAddress
  const setAddress = isControlled ? setControlledAddress : setLocalAddress

  useSetWindow({ title: platformLabels.Address, window })

  const onAddressSubmit = async post => {
    if (!required) {
      setAddress(post)
      onSubmit(post, window)

      return
    }

    const payload = { ...post, recordId: currentRecordId || address?.recordId || null}

    const res = await postRequest({
      extension: SystemRepository.Address.set,
      record: JSON.stringify(payload)
    })

    const newRecordId = res?.recordId || currentRecordId || null

    const updatedAddress = {
      ...payload,
      recordId: newRecordId,
      addressId: newRecordId
    }

    setCurrentRecordId(newRecordId)
    setAddress(updatedAddress)
    onSubmit(updatedAddress, window)
  }

  useEffect(() => {
    if (!isControlled && currentRecordId) {
      ;(async () => {
        const res = await getRequest({
          extension: SystemRepository.Address.get,
          parameters: `_filter=&_recordId=${currentRecordId}`
        })
        setLocalAddress(res?.record || null)
      })()
    }
  }, [currentRecordId, isControlled])

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
