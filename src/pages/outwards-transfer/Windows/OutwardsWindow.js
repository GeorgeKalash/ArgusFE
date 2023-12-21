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
    plantStore,
    countryStore,
    onCountrySelection,
    dispersalTypeStore,
    onDispersalSelection,
    currencyStore,
    onCurrencySelection,
    agentsStore,
    correspondentStore,
    setCorrespondentStore,
    lookupCorrespondent,
    onAmountDataFill,
    onIdNoBlur,
    labels,
    setProductsWindowOpen,
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
                  plantStore={plantStore?.list}
                  countryStore={countryStore?.list}
                  onCountrySelection={onCountrySelection}
                  dispersalTypeStore={dispersalTypeStore?.list}
                  onDispersalSelection={onDispersalSelection}
                  currencyStore={currencyStore?.list}
                  onCurrencySelection={onCurrencySelection}
                  agentsStore={agentsStore?.list}
                  correspondentStore={correspondentStore}
                  setCorrespondentStore={setCorrespondentStore}
                  lookupCorrespondent={lookupCorrespondent}
                  onAmountDataFill={onAmountDataFill}
                  onIdNoBlur={onIdNoBlur}
                  editMode={editMode}
                  setProductsWindowOpen={setProductsWindowOpen}
                  maxAccess={maxAccess}
               />
               </CustomTabPanel>
            </Window> 
         )
    }
    
    export default OutwardsWindow