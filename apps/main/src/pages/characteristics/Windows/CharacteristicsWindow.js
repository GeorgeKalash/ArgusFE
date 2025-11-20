// ** Custom Imports
import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import CharacteristicsForm from '../forms/CharacteristicsForm'
import ValueFormList from '../forms/ValueFormList'

const CharacteristicsWindow = ({ height, recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState(recordId)

  const [store, setStore] = useState({
    recordId: recordId || null,
    countries: []
  })

  const tabs = [{ label: labels.characteristics }, { label: labels.values, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel height={height} index={0} value={activeTab} maxAccess={maxAccess}>
        <CharacteristicsForm
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab} maxAccess={maxAccess}>
        <ValueFormList
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          maxAccess={maxAccess}
          store={store}
        />
      </CustomTabPanel>
    </>
  )
}

export default CharacteristicsWindow
