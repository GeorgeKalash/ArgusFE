// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import RelationTypeTab from 'src/pages/profession/Tabs/ProfessionTab'

const ProfessionWindow = ({
    onClose,
    width,
    height,
    onSave,
    editMode,
    typeStore,
    ProfessionValidation,
    labels,
    maxAccess
}) => { console.log(ProfessionValidation)
  
return (

    <Window
    id='RelationWindow'
    Title={labels.profession}
    onClose={onClose}
    width={width}
    height={height}
    onSave={onSave}
    ProfessionValidation={ProfessionValidation}
    typeStore={typeStore}
    >
         <CustomTabPanel>
           <RelationTypeTab
              labels={labels}
              ProfessionValidation={ProfessionValidation}
              typeStore={typeStore}
              maxAccess={maxAccess}
           />
           </CustomTabPanel>
        </Window>
     )
}

export default ProfessionWindow
