// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs

import ConfirmNumberTab from '../Tabs/ConfirmNumberTab'

const ConfirmNumberWindow = ({
  onSave,
  onClose,
  width,
  height,
  labels,
  editMode,
  clientIndividualFormValidation,
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
        <ConfirmNumberTab clientIndividualFormValidation={clientIndividualFormValidation} labels={labels} />
      </CustomTabPanel>
    </Window>
  )
}

export default ConfirmNumberWindow
