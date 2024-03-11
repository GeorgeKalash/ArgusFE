// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CorrespondentCountriesTab from '../Tabs/CorrespondentCountriesTab'
import CorrespondentCurrenciesTab from '../Tabs/CorrespondentCurrenciesTab'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import CorrespondentForm from '../Forms/CorrespondentForm'
import CorrespondentCountriesForm from '../Forms/CorrespondentCountriesForm'
import CorrespondentCurrenciesForm from '../Forms/CorrespondentCurrenciesForm'

const CorrespondentWindow = ({
  height,
  recordId,

  // editMode,
  // setEditMode,
  lookupBpMasterData,
  bpMasterDataStore,
  setBpMasterDataStore,
  correspondentValidation,

  //countries tab - inline edit grid
  countriesGridValidation,
  countriesInlineGridColumns,

  //currencies tab - inline edit grid
  currenciesGridValidation,
  currenciesInlineGridColumns,
  corId,
  labels,
  maxAccess
}) => {

  const [activeTab , setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState(recordId)

  const [store , setStore] = useState({
    recordId : recordId || null,
    countries: []
  })

  const tabs = [
    { label: 'Main' },
    { label: 'Countries', disabled: !editMode },
    { label: 'Currencies', disabled: !editMode }
  ]

  return (
    <>
    <CustomTabs  tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

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

        />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={2} value={activeTab}>
        <CorrespondentCurrenciesForm
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

export default CorrespondentWindow
