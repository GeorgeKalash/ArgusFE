// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CorrespondentTab from 'src/pages/correspondent/Tabs/CorrespondentTab'
import CorrespondentCountriesTab from '../Tabs/CorrespondentCountriesTab'

const CorrespondentWindow = ({
  tabs,
  activeTab,
  setActiveTab,
  onClose,
  width,
  height,
  onSave,
  editMode,
  correspondentValidation,
  countryStore,
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
          editMode={editMode}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <CorrespondentCountriesTab
          countryStore={countryStore}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default CorrespondentWindow
