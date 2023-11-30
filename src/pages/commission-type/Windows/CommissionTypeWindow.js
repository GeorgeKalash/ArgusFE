// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CommissionTypeTab from 'src/pages/commission-type/Tabs/CommissionTypeTab'

const CommissionTypeWindow = ({
    onClose,
    width,
    height,
    onSave,
    editMode,
    typeStore,
    commissiontypeValidation,
    labels,
    maxAccess
}) => {return (
    <Window
    id='CommissionTypeWindow'
    Title={labels.comissiontype}
    onClose={onClose}
    width={width}
    height={height}
    onSave={onSave}
    commissiontypeValidation={commissiontypeValidation}
    typeStore={typeStore}
    >
         <CustomTabPanel>
           <CommissionTypeTab
              labels={labels}
              commissiontypeValidation={commissiontypeValidation}
              typeStore={typeStore}
              editMode={editMode}
              maxAccess={maxAccess}
           />
           </CustomTabPanel>
        </Window> 
     )
}

export default CommissionTypeWindow