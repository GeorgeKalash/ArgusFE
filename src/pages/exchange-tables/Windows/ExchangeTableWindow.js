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
    typeStore,
    exchangeTableValidation,
    currencyStore,
    FCurrencyStore,
    labels,
    maxAccess
}) => {

  console.log(exchangeTableValidation)

return (

    <Window
    id='RelationWindow'
    Title={labels.ExchangeTable}
    onClose={onClose}
    width={width}
    height={height}
    onSave={onSave}
    exchangeTableValidation={exchangeTableValidation}
    typeStore={typeStore}
    >
         <CustomTabPanel>
           <ExchangeTableTab
              labels={labels}
              exchangeTableValidation={exchangeTableValidation}
              typeStore={typeStore}
              maxAccess={maxAccess}
              currencyStore={currencyStore}
              fCurrencyStore={fCurrencyStore}
              rateAgainstStore={rateAgainstStore}
           />
           </CustomTabPanel>
        </Window>
     )
}

export default ExchangeTableWindow
