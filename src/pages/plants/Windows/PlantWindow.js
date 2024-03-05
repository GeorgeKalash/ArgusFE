// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import PlantForm from '../Forms/PlantForm'
import AddressForm from '../Forms/AddressForm'
import { useState } from 'react'
import { Tab, Tabs } from '@mui/material'
import { CustomTabs } from 'src/components/Shared/CustomTabs'

const PlantWindow = ({
  labels,
  editMode,
  maxAccess,
  setEditMode,
  recordId,
  setRecordId,
}) => {

  const [activeTab , setActiveTab] = useState(0)
  const tabs = [{ label: labels.plant }, { label: labels.address , disabled: !editMode }]

return (
    <>
      <CustomTabs  tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <CustomTabPanel index={0} value={activeTab}>
        <PlantForm
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
           _labels={labels}
          recordId={recordId}
          setRecordId={setRecordId}
          maxAccess={maxAccess}
          editMode={editMode}
        />
      </CustomTabPanel>

    </>
  )
}

export default PlantWindow
