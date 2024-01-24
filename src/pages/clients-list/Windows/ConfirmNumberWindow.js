// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs

import Confirmation from 'src/components/Shared/Confirmation'

const ConfirmNumberWindow = ({
  onClose,
  labels,
  clientIndividualFormValidation,
  setWindowConfirmNumberOpen,
  idTypeStore,
}) => {



return (
    <Window
      Title={labels.confirmNb}
      onClose={onClose}
      controlled={true}
      width={350}
      height={300}
       >
      <CustomTabPanel>
         <Confirmation   setWindowConfirmNumberOpen ={setWindowConfirmNumberOpen} idTypeStore={idTypeStore} formik={clientIndividualFormValidation} labels={labels}  />
      </CustomTabPanel>
    </Window>
  )
}

export default ConfirmNumberWindow
