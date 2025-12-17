import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import ClassesForm from '../forms/ClassesForm'
import CharacteristicsFormList from '../forms/CharacteristicsFormList'
import FunctionsFormList from '../forms/FunctionFormList'

const ClassesWindow = ({ height, recordId, labels, maxAccess, expanded }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState(recordId)

  const [store, setStore] = useState({
    recordId: recordId || null,
    countries: []
  })

  const tabs = [
    { label: labels.class },
    { label: labels.characteristics, disabled: !store.recordId },
    { label: labels.function, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel height={height} index={0} value={activeTab} maxAccess={maxAccess}>
        <ClassesForm
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab} maxAccess={maxAccess}>
        <CharacteristicsFormList
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          maxAccess={maxAccess}
          store={store}
          expanded={expanded}
          height={height}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={2} value={activeTab} maxAccess={maxAccess}>
        <FunctionsFormList
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          maxAccess={maxAccess}
          store={store}
          expanded={expanded}
          height={height}
        />
      </CustomTabPanel>
    </>
  )
}

export default ClassesWindow
