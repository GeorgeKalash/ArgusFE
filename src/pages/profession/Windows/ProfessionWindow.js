// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import ProfessionTab from 'src/pages/profession/Tabs/ProfessionTab'

const ProfessionWindow = ({
    onClose,
    width,
    height,
    onSave,
    diplomatStore,
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
    >
         <CustomTabPanel>
           <ProfessionTab
              labels={labels}
              ProfessionValidation={ProfessionValidation}
              diplomatStore={diplomatStore}
              maxAccess={maxAccess}
           />
           </CustomTabPanel>
        </Window>
     )
}

export default ProfessionWindow
