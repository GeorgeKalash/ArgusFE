// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import PlantForm from '../Forms/PlantForm'
import { useContext, useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import toast from 'react-hot-toast'
import AddressForm from 'src/components/Shared/AddressForm'
import { ControlContext } from 'src/providers/ControlContext'

const PlantWindow = ({ labels, editMode, maxAccess, recordId, height }) => {
  const [store, setStore] = useState({
    recordId: recordId || null,
    plant: null,
    address: null
  })

  const [activeTab, setActiveTab] = useState(0)
  const { platformLabels } = useContext(ControlContext)
  const tabs = [{ label: labels.plant }, { label: labels.address, disabled: !store.recordId }]
  const { postRequest } = useContext(RequestsContext)

  async function onSubmit(address) {
    const addressId = address.addressId
    setStore(prevStore => ({
      ...prevStore,
      address: { ...prevStore.address, recordId: addressId }
    }))
    if (!store.plant.addressId) {
      const res = { ...store.plant, addressId: addressId }
      if (res) {
        const data = { ...res, recordId: store?.recordId }
        await postRequest({
          extension: SystemRepository.Plant.set,
          record: JSON.stringify(data)
        })
          .then(() => {
            toast.success(platformLabels.Added)
          })
          .catch(error => {})
      }
    } else {
      toast.success(platformLabels.Edited)
    }
  }
  function setAddress(res) {
    setStore(prevStore => ({
      ...prevStore,
      address: res
    }))
  }

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <PlantForm _labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} editMode={store.recordId} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <AddressForm
          _labels={labels}
          maxAccess={maxAccess}
          editMode={editMode}
          recordId={store?.plant?.addressId}
          address={store.address}
          setAddress={setAddress}
          onSubmit={onSubmit}
        />
      </CustomTabPanel>
    </>
  )
}

export default PlantWindow
