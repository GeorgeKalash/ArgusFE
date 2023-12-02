// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CorrespondentTab from 'src/pages/correspondent/Tabs/CorrespondentTab'
import CorrespondentCountriesTab from '../Tabs/CorrespondentCountriesTab'
import CorrespondentCurrenciesTab from '../Tabs/CorrespondentCurrenciesTab'

const CorrespondentWindow = ({
  tabs,
  activeTab,
  setActiveTab,
  onClose,
  width,
  height,
  onSave,
  editMode,
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

  labels,
  maxAccess
}) => {
  return (
    <Window
      id='CorrespondentWindow'
      Title={labels.correspondent}
      onClose={onClose}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      width={width}
      height={height}
      onSave={onSave}
      correspondentValidation={correspondentValidation}
    >
      <CustomTabPanel index={0} value={activeTab}>
        <CorrespondentTab
          labels={labels}
          correspondentValidation={correspondentValidation}
          lookupBpMasterData={lookupBpMasterData}
          bpMasterDataStore={bpMasterDataStore}
          setBpMasterDataStore={setBpMasterDataStore}
          editMode={editMode}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <CorrespondentCountriesTab
          correspondentValidation={correspondentValidation}
          countriesGridValidation={countriesGridValidation}
          countriesInlineGridColumns={countriesInlineGridColumns}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <CorrespondentCurrenciesTab
          correspondentValidation={correspondentValidation}
          currenciesGridValidation={currenciesGridValidation}
          currenciesInlineGridColumns={currenciesInlineGridColumns}
          maxAccess={maxAccess}
          editMode={editMode}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default CorrespondentWindow
