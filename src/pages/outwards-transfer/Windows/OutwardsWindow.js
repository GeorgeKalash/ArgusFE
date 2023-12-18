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
    productsStore,
    onAmountDataFill,
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
                  productsStore={productsStore?.list}
                  onAmountDataFill={onAmountDataFill}
                  editMode={editMode}
                  setProductsWindowOpen={setProductsWindowOpen}
                  maxAccess={maxAccess}
               />
               </CustomTabPanel>
            </Window> 
         )
    }
    
    export default OutwardsWindow