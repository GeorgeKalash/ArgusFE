// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CurrencyTab from 'src/pages/currencies/Tabs/CurrencyTab'

const CurrencyWindow = ({
    onClose,
    width,
    height,
    onSave,
    editMode,
    decimalStore,
    profileStore,
    currencyStore,
    currencyValidation,
    labels,
    maxAccess
}) => {
    return (
        <Window
        id='CurrencyWindow'
        Title={labels.currency}
        onClose={onClose}
        width={width}
        height={height}
        onSave={onSave}
        currencyValidation={currencyValidation}
        decimalStore={decimalStore}
        profileStore={profileStore}
        currencyStore={currencyStore}
        >
             <CustomTabPanel>
               <CurrencyTab
                  labels={labels}
                  currencyValidation={currencyValidation}
                  decimalStore={decimalStore}
                  profileStore={profileStore}
                  currencyStore={currencyStore}
                  editMode={editMode}
                  maxAccess={maxAccess}
               />
               </CustomTabPanel>
            </Window> 
         )
    }
    
    export default CurrencyWindow