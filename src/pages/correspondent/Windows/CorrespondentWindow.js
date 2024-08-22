// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import CorrespondentForm from '../Forms/CorrespondentForm'
import CorrespondentCountriesForm from '../Forms/CorrespondentCountriesForm'
import CorrespondentCurrenciesForm from '../Forms/CorrespondentCurrenciesForm'

const CorrespondentWindow = ({ height, recordId, labels, maxAccess, expanded }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState(recordId)

  const [store, setStore] = useState({
    recordId: recordId || null,
    countries: []
  })

  const tabs = [
    { label: labels.main },
    { label: labels.countries, disabled: !store.recordId },
    { label: labels.currencies, disabled: !editMode }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <CustomTabPanel height={height} index={0} value={activeTab}>
        <CorrespondentForm
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <CorrespondentCountriesForm
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          maxAccess={maxAccess}
          store={store}
          expanded={expanded}
        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={2} value={activeTab}>
        <CorrespondentCurrenciesForm
          labels={labels}
          setEditMode={setEditMode}
          setStore={setStore}
          maxAccess={maxAccess}
          expanded={expanded}
          store={store}
        />
      </CustomTabPanel>
    </>
  )
}

export default CorrespondentWindow
