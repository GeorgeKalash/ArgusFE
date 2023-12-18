// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import IdCategoryTab from '../Tabs/IdCategoryTab'

const IdCategoryWindow = ({
    onClose,
    width,
    height,
    onSave,
    editMode,
    typeStore,
    IdCategoryValidation,
    labels,
    maxAccess
}) => {

return (

    <Window
    id='test'
    Title={labels.title}
    onClose={onClose}
    width={width}
    height={height}
    onSave={onSave}
    IdCategoryValidation={IdCategoryValidation}
    typeStore={typeStore}
    >
         <CustomTabPanel>
           <IdCategoryTab
              labels={labels}
              IdCategoryValidation={IdCategoryValidation}
              typeStore={typeStore}
              maxAccess={maxAccess}
           />
           </CustomTabPanel>
        </Window>
     )
}

export default IdCategoryWindow
