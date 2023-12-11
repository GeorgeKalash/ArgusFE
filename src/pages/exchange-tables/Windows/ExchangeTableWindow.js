// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import ExchangeTableTab from '../Tabs/ExchangeTableTab'

const ExchangeTableWindow = ({
    onClose,
    width,
    height,
    onSave,
    editMode,
    exchangeTableValidation,
    currencyStore,
    fCurrencyStore,
    rateAgainstStore,
    RCMStore,
    labels,
    setRateAgainst,
    maxAccess
}) => {


return (

    <Window
    id='RelationWindow'
    Title={labels.ExchangeTable}
    onClose={onClose}
    width={width}
    height={height}
    onSave={onSave}
    exchangeTableValidation={exchangeTableValidation}
    >
         <CustomTabPanel>
           <ExchangeTableTab
              labels={labels}
              exchangeTableValidation={exchangeTableValidation}
              maxAccess={maxAccess}
              currencyStore={currencyStore}
              fCurrencyStore={fCurrencyStore}
              rateAgainstStore={rateAgainstStore}
              RCMStore={RCMStore}
              setRateAgainst={setRateAgainst}
           />
           </CustomTabPanel>
        </Window>
     )
}

export default ExchangeTableWindow
