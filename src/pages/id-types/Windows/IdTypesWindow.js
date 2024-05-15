import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import IdTypesForm from '../forms/IdTypesForm'
import IdFieldsForm from '../forms/IdFieldsForm'
import { InterfacesForm } from 'src/components/Shared/InterfacesForm'
import { ResourceIds } from 'src/resources/ResourceIds'

const IdTypesWindow = ({ height, recordId, labels, maxAccess, expanded }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState(recordId)

  const [store, setStore] = useState({
    recordId: recordId || null,
    IdField: null,
    name: ''
  })

  const tabs = [
    { label: labels.main },
    { label: labels.idFields, disabled: !store.recordId },
    { label: labels.interface, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <IdTypesForm
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <IdFieldsForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={maxAccess}
          height={height}
          expanded={expanded}
          editMode={editMode}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={2} value={activeTab}>
        <InterfacesForm
          recordId={store.recordId}
          resourceId={ResourceIds.IdTypes}
          name={store.name}
          expanded={expanded}
          height={height}
        />
      </CustomTabPanel>
    </>
  )
}

export default IdTypesWindow
