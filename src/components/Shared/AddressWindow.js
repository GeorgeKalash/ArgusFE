// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import AddressTab from 'src/components/Shared/AddressTab'

const AddressWindow = ({
  labels,
  addressValidation,
  maxAccess,
  countryStore,
  stateStore,
  fillStateStore,
  lookupCity,
  cityStore,
  setCityStore,
  lookupCityDistrict,
  cityDistrictStore,
  setCityDistrictStore,
  editMode
}) => {
  return (
    <Window
      id='AddressWindow'
      Title={labels.address}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
      addressValidation={addressValidation}
      countryStore={countryStore}
      stateStore={stateStore}
      cityStore={cityStore}
      cityDistrictStore={cityDistrictStore}
    >
      <CustomTabPanel>
        <AddressTab
          countryStore={countryStore}
          stateStore={stateStore}
          labels={labels}
          lookupCity={lookupCity}
          fillStateStore={fillStateStore}
          cityStore={cityStore}
          setCityStore={setCityStore}
          fillCountryStore={fillCountryStore}
          lookupCityDistrict={lookupCityDistrict}
          cityDistrictStore={cityDistrictStore}
          setCityDistrictStore={setCityDistrictStore}
          addressValidation={agentBranchValidation}
          maxAccess={maxAccess}
          editMode={editMode}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default AddressWindow
