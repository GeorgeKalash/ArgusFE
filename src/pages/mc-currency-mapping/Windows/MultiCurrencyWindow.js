import Window from 'src/components/Shared/Window'
import MultiCurrencyForm from '../forms/MultiCurrencyForm'

const MultiCurrencyWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId,
  currencyId,
  rateTypeId,

}) => {
  
  return (
    <Window
      id='MultiCurrencyWindow'
      Title={labels.mc_mapping}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <MultiCurrencyForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
        currencyId={currencyId}
        rateTypeId={rateTypeId}
      />
    </Window>
  )
}

export default MultiCurrencyWindow
