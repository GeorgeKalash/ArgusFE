// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import AddressTab from 'src/components/Shared/AddressTab'

const AddressWindow = ({
  onClose,
  onSave,
  width,
  height,

  labels,
  addressValidation,
  maxAccess,
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
      width={width} //check
      height={height} //check
      onSave={onSave}
      addressValidation={addressValidation}
      stateStore={stateStore}
      cityStore={cityStore}
      cityDistrictStore={cityDistrictStore}
    >
      <CustomTabPanel>
        <AddressTab
          stateStore={stateStore}
          labels={labels}
          lookupCity={lookupCity}
          fillStateStore={fillStateStore}
          cityStore={cityStore}
          setCityStore={setCityStore}
          lookupCityDistrict={lookupCityDistrict}
          cityDistrictStore={cityDistrictStore}
          setCityDistrictStore={setCityDistrictStore}
          addressValidation={addressValidation}
          maxAccess={maxAccess}
          editMode={editMode}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default AddressWindow
