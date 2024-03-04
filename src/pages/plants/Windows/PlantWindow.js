// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import PlantTab from 'src/pages/plants/Tabs/PlantTab'
import AddressTab from 'src/components/Shared/AddressTab'
import PlantForm from '../Forms/PlantForm'
import FormShell from 'src/components/Shared/FormShell'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import AddressForm from '../Forms/AddressForm'
import { useState } from 'react'

const PlantWindow = ({
  onClose,
  plantValidation,
  width,
  height,
  labels,
  editMode,
  maxAccess,
  setEditMode,
  tabs,
  recordId,
  setRecordId,
  activeTab,
  setActiveTab,
  addressValidation
}) => {

  const [post , setPost] = useState(false)

  return (
    <Window id='PlantWindow' Title='Plant' onClose={onClose} width={width} height={height}
     controlled={true}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}>
      <CustomTabPanel index={0} value={activeTab}>
        <PlantForm
          plantValidation={plantValidation}
          _labels={labels}
          maxAccess={maxAccess}
          editMode={editMode}
          setEditMode={setEditMode}
          recordId={recordId}
          setRecordId={setRecordId}

        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <AddressForm
          addressValidation={addressValidation}
          plantValidation={plantValidation}
          recordId={recordId}
          setRecordId={setRecordId}
          maxAccess={maxAccess}
          editMode={editMode}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default PlantWindow
