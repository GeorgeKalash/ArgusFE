import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import PlantForm from '../Forms/PlantForm'
import { useContext, useEffect, useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import toast from 'react-hot-toast'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import { ControlContext } from 'src/providers/ControlContext'
import SchedulesTab from '../Forms/SchedulesTab'

const PlantWindow = ({ labels, editMode, maxAccess, recordId, height }) => {
  const [store, setStore] = useState({
    recordId: recordId,
    plant: null,
    address: null,
    schedules: null
  })

  const [activeTab, setActiveTab] = useState(0)
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const tabs = [
    { label: labels.plant },
    { label: labels.address, disabled: !store.recordId },
    { label: labels.schedules, disabled: !store.recordId }
  ]

  useEffect(() => {
    const addressId = store.plant?.addressId
    if (!addressId) return

    getRequest({
      extension: SystemRepository.Address.get,
      parameters: `_filter=&_recordId=${addressId}`
    }).then(res => {
      setStore(prev => ({ ...prev, address: res.record }))
    })
  }, [store.plant?.addressId])

  async function onAddressSubmit(values) {
    const data = { ...values, recordId: store.plant?.addressId }

    const res = await postRequest({
      extension: SystemRepository.Address.set,
      record: JSON.stringify(data)
    })

    const addressId = res.recordId
    const updatedAddress = { ...values, addressId }

    setStore(prev => ({
      ...prev,
      address: updatedAddress,
      plant: { ...prev.plant, addressId }
    }))

    if (!store.plant?.addressId) {
      const updatedPlant = {
        ...store.plant,
        addressId,
        recordId: store.recordId
      }

      await postRequest({
        extension: SystemRepository.Plant.set,
        record: JSON.stringify(updatedPlant)
      })

      toast.success(platformLabels.Added)
    } else {
      toast.success(platformLabels.Edited)
    }
  }

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <PlantForm _labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} editMode={store.recordId} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <AddressFormShell
          _labels={labels}
          maxAccess={maxAccess}
          editMode={editMode}
          address={store.address}
          setAddress={addr => setStore(prev => ({ ...prev, address: addr }))}
          allowPost={true}
          onSubmit={onAddressSubmit}
          isCleared={false}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={2} value={activeTab}>
        <SchedulesTab
          _labels={labels}
          maxAccess={maxAccess}
          store={store}
          setStore={setStore}
          editMode={store.recordId}
        />
      </CustomTabPanel>
    </>
  )
}

export default PlantWindow
