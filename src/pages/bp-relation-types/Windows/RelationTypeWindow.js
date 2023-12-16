// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import RelationTypeTab from '../Tabs/RelationTypeTab'

const RelationTypeWindow = ({
    onClose,
    width,
    height,
    onSave,
    editMode,
    typeStore,
    RelationTypeValidation,
    labels,
    maxAccess
}) => { console.log(RelationTypeValidation)

return (

    <Window
    id='RelationWindow'
    Title={labels.title}
    onClose={onClose}
    width={width}
    height={height}
    onSave={onSave}
    RelationTypeValidation={RelationTypeValidation}
    typeStore={typeStore}
    >
         <CustomTabPanel>
           <RelationTypeTab
              labels={labels}
              RelationTypeValidation={RelationTypeValidation}
              typeStore={typeStore}
              maxAccess={maxAccess}
           />
           </CustomTabPanel>
        </Window>
     )
}

export default RelationTypeWindow
