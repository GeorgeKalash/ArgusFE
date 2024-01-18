// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ClientTab from '../Tabs/ClientTab'
import AddressTab from 'src/components/Shared/AddressTab'

const AddressWorkWindow = ({
  onSave, onClose,
  requiredOptional,
  addressValidation,
  width,
  height,
  labels,
  editMode,
  setShowWorkAddress,
  maxAccess
}) => {
  return (
    <Window
      id='WordAddressWindow'
      Title={labels.pageTitle}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
      disabledInfo={!editMode && true}
      disabledSubmit={editMode && true}
       >
      <CustomTabPanel>
           <AddressTab labels={labels} addressValidation={addressValidation}  requiredOptional={requiredOptional} readOnly={editMode && true} />
      </CustomTabPanel>
    </Window>
  )
}

export default AddressWorkWindow
