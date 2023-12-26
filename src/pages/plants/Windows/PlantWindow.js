// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import PlantTab from 'src/pages/plants/Tabs/PlantTab'
import AddressTab from 'src/components/Shared/AddressTab'

const PlantWindow = ({
  onClose,
  onSave,
  plantValidation,
  costCenterStore,
  plantGroupStore,
  segmentStore,
  width,
  height,
  _labels,
  editMode,
  maxAccess,

  tabs,
  activeTab,
  setActiveTab,
  addressLabels,
  countryStore,
  stateStore,
  fillStateStore,
  cityStore,
  setCityStore,
  lookupCity,
  cityDistrictStore,
  setCityDistrictStore,
  lookupCityDistrict,
  fillCountryStore,
  addressValidation
}) => {
  return (
    <Window id='PlantWindow' Title={_labels.plant} onClose={onClose} width={width} height={height} onSave={onSave}
    tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}>
      <CustomTabPanel index={0} value={activeTab}>
        <PlantTab
          plantValidation={plantValidation}
          costCenterStore={costCenterStore}
          plantGroupStore={plantGroupStore}
          segmentStore={segmentStore}
          _labels={_labels}
          maxAccess={maxAccess}
          editMode={editMode}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <AddressTab
          countryStore={countryStore}
          stateStore={stateStore}
          labels={_labels}
          lookupCity={lookupCity}
          fillStateStore={fillStateStore}
          cityStore={cityStore}
          setCityStore={setCityStore}
          fillCountryStore={fillCountryStore}
          addressValidation={addressValidation}
          maxAccess={maxAccess}
          lookupCityDistrict={lookupCityDistrict}
          cityDistrictStore={cityDistrictStore}
          setCityDistrictStore={setCityDistrictStore}
          editMode={editMode}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default PlantWindow
