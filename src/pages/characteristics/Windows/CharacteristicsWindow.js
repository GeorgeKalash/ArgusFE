// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import CharacteristicsForm from '../forms/CharacteristicsForm'
import ValueFormList from '../forms/ValueFormList'

const CharacteristicsWindow = ({
  height,
  recordId,
  labels,
  maxAccess,
  expanded
}) => {
  const [activeTab , setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState(recordId)

  const [store , setStore] = useState({
    recordId : recordId || null,
    countries: []
  })

  const tabs = [
    { label: labels.characteristics },
    { label: labels.values, disabled: !store.recordId },
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <CharacteristicsForm
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <ValueFormList
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          maxAccess={maxAccess}
          store={store}
          expanded={expanded}
        />
      </CustomTabPanel>
    </>
  )
}

export default CharacteristicsWindow
