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
import { Tab, Tabs } from '@mui/material'

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

  // activeTab,
  // setActiveTab,
  addressValidation
}) => {

  const [activeTab , setActiveTab] = useState(0)
  const [post , setPost] = useState(false)

  return (
    < >
        <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)}>
                {tabs.map((tab, i) => (
                  <Tab key={i} label={tab.label} disabled={tab?.disabled} />
                ))}
              </Tabs>
      <CustomTabPanel index={0} value={activeTab}>rrrr
        {/* <PlantForm
          plantValidation={plantValidation}
          _labels={labels}
          maxAccess={maxAccess}
          editMode={editMode}
          setEditMode={setEditMode}
          recordId={recordId}
          setRecordId={setRecordId}

        /> */}
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>sss
        {/* <AddressForm
          addressValidation={addressValidation}
          plantValidation={plantValidation}
          recordId={recordId}
          setRecordId={setRecordId}
          maxAccess={maxAccess}
          editMode={editMode}
        /> */}
      </CustomTabPanel>

    </>
  )
}

export default PlantWindow
