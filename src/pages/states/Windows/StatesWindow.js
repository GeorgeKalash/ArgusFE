// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import StatesTab from 'src/pages/states/Tabs/StatesTab'

const StatesWindow = ({
  onClose,
  width,
  height,
  onSave,
  statesValidation,
  labels,
  maxAccess,
  countryStore
}) => {
  return (
    <Window
      id='StatesWindow'
      Title={labels.states}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
    >
      <CustomTabPanel>
        <StatesTab
          labels={labels}
          statesValidation={statesValidation}
          maxAccess={maxAccess}
          countryStore={countryStore}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default StatesWindow
