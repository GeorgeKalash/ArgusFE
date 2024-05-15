// ** Custom Imports
import Window from 'src/components/Shared/Window'

// **Tabs
import CashAccountForm from 'src/pages/fi-cash-accounts/forms/CashAccountForm'

const CashAccountWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <>
      <Window id='CashAccountWindow' Title={labels.cashAccount} controlled={true} width={600} onClose={onClose}>
        <CashAccountForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
      </Window>
    </>
  )
}

export default CashAccountWindow
