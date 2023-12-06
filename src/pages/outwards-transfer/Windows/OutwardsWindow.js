// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import OutwardsTab from '../Tabs/OutwardsTab'

const OutwardsWindow = ({
    onClose,
    width,
    height,
    onSave,
    editMode,
    outwardsValidation,
    countryStore,
    onCountrySelection,
    dispersalTypeStore,
    onDispersalSelection,
    currencyStore,
    onCurrencySelection,
    agentsStore,
    onAmountDataFill,
    labels,
    maxAccess
}) => {
return (
        <Window
        id='OutwardsWindow'
        Title='outwards'
        onClose={onClose}
        width={width}
        height={height}
        onSave={onSave}
        outwardsValidation={outwardsValidation}
        >
             <CustomTabPanel>
               <OutwardsTab
                  labels={labels}
                  outwardsValidation={outwardsValidation}
                  countryStore={countryStore?.list}
                  onCountrySelection={onCountrySelection}
                  dispersalTypeStore={dispersalTypeStore?.list}
                  onDispersalSelection={onDispersalSelection}
                  currencyStore={currencyStore?.list}
                  onCurrencySelection={onCurrencySelection}
                  agentsStore={agentsStore?.list}
                  onAmountDataFill={onAmountDataFill}
                  editMode={editMode}
                  maxAccess={maxAccess}
               />
               </CustomTabPanel>
            </Window> 
         )
    }
    
    export default OutwardsWindow