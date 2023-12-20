// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import NumberRangeTab from '../Tabs/NumberRangeTab'

const NumberRangeWindow = ({
  onClose,
  width,
  height,
  onSave,
  editMode,
  typeStore,
  NumberRangeValidation,
  setRequired,
  labels,
  maxAccess
}) => {
  return (
    <Window
      id='RelationWindow'
      Title={labels.title}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
      NumberRangeValidation={NumberRangeValidation}
      typeStore={typeStore}
    >
      <CustomTabPanel>
        <NumberRangeTab
          labels={labels}
          NumberRangeValidation={NumberRangeValidation}
          typeStore={typeStore}
          maxAccess={maxAccess}
          setRequired={setRequired}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default NumberRangeWindow
