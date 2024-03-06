// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import PlantForm from '../Forms/PlantForm'
import AddressForm from '../Forms/AddressForm'
import { useContext, useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import toast from 'react-hot-toast'

const PlantWindow = ({
  labels,
  editMode,
  maxAccess,
  recordId,
  height
}) => {

  const [store , setStore] = useState({
    recordId : recordId || null,
    addressId : null,
    plant: [],
    address: [],
    editMode: editMode
  })
  const [activeTab , setActiveTab] = useState(0)
  const tabs = [{ label: labels.plant }, { label: labels.address , disabled: !store.editMode }]
  const { postRequest } = useContext(RequestsContext)

  async function onSubmit (address){
    const addressId = address.recordId

    if(!store.plant.addressId){
      setStore(prevStore => ({
        ...prevStore,
        plant:{ ...store.plant , addressId :address.recordId}
      }));
    const res = store.plant
    if(res){
    const data = {...res , addressId: addressId || store.plant.addressId , recordId: store.recordId}
     await  postRequest({
      extension: SystemRepository.Plant.set,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (!addressId) {
          toast.success('Record Added Successfully')


        }

        else toast.success('Record Edited Successfully')
      })
      .catch(error => {
      })}
  }else{

    toast.success('Record Added Successfully')
  }

}


return (
    <>
      <CustomTabs  tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <CustomTabPanel height={"100%"} index={0} value={activeTab}>
        <PlantForm
          _labels={labels}
          maxAccess={maxAccess}
          store={store}
          setStore={setStore}

        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <AddressForm
           _labels={labels}
          maxAccess={maxAccess}
          editMode={editMode}
          recordId={store.plant.addressId}
          address={store.address}
          store={store}
          setStore={setStore}
          onSubmit={onSubmit}
        />
      </CustomTabPanel>

    </>
  )
}

export default PlantWindow
