import { SystemRepository } from 'src/repositories/SystemRepository'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import useSetWindow from 'src/hooks/useSetWindow'

const AddressForm = ({
  recordId,
  editMode,
  onSubmit = () => {},
  window,
  actions = [],
  address: propAddress,
  setAddress: setPropAddress,
  required = true,
  ...props
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [updatedRecordId, setRecordId] = useState(recordId || null)
  const [localAddress, setLocalAddress] = useState()
  const [isControlled, setControll] = useState(!!propAddress && !!setPropAddress)
  const address = isControlled ? propAddress : localAddress
  const setAddress = isControlled ? setPropAddress : setLocalAddress 

  useSetWindow({ title: platformLabels.Address, window })

  function onAddressSubmit(post) {
    if (required) {
      const data = { ...post, recordId : updatedRecordId}

      postRequest({
        extension: SystemRepository.Address.set,
        record: JSON.stringify(data)
      }).then(res => {
        const updatedData = {...data, recordId: res?.recordId || null, addressId: res?.recordId || null}
        setRecordId(prev => res?.recordId || prev || null)
        setControll(false)
        setAddress(updatedData)
        onSubmit(updatedData, window)
      })
    } else {
      setAddress(post)
      onSubmit(post, window)
    }
  }

  useEffect(() => {
    if (!isControlled && updatedRecordId) {
      ;(async () => {
        const res = await getRequest({
          extension: SystemRepository.Address.get,
          parameters: `_filter=&_recordId=${updatedRecordId}`
        })
        setLocalAddress(res.record)
      })()
    }
  }, [updatedRecordId, isControlled])

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
