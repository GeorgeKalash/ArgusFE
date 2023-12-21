// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import LegalStatusTab from 'src/pages/legal-status/Tabs/legalStatusTab'


const LegalStatusWindow = ({
    onClose,
    onSave,
    legalStatusValidation,
    width,
    height,
    editMode,
    _labels,
    maxAccess
}) => {
    return (
      <Window id='LegalStatusWindow' Title={_labels.legalStatus} onClose={onClose} width={width} height={height} 
      onSave={onSave} legalStatusValidation={legalStatusValidation}>
         <CustomTabPanel>
             <LegalStatusTab
                 legalStatusValidation={legalStatusValidation}
                 _labels={_labels}
                 editMode={editMode}
                 maxAccess={maxAccess}
             />
         </CustomTabPanel>
     </Window>
    )
}


export default LegalStatusWindow
