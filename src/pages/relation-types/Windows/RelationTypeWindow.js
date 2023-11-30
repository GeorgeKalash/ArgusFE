// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import RelationTypeTab from 'src/pages/relation-types/Tabs/RelationTypeTab'

const RelationTypeWindow = ({
    onClose,
    width,
    height,
    onSave,
    editMode,
    typeStore,
    relationTypesValidation,
    labels,
    maxAccess
}) => {return (
    <Window
    id='RelationWindow'
    Title={labels.relationtype}
    onClose={onClose}
    width={width}
    height={height}
    onSave={onSave}
    relationTypesValidation={relationTypesValidation}
    typeStore={typeStore}
    >
         <CustomTabPanel>
           <RelationTypeTab
              labels={labels}
              relationTypesValidation={relationTypesValidation}
              typeStore={typeStore}
              maxAccess={maxAccess}
           />
           </CustomTabPanel>
        </Window>
     )
}

export default RelationTypeWindow
