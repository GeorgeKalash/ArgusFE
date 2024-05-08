// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CurrencyForm from 'src/pages/currencies/forms/CurrencyForm'

const CurrencyWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='CurrencyWindow' Title={labels.currency} controlled={true} onClose={onClose} height={500} width={500}>
      <CurrencyForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default CurrencyWindow
