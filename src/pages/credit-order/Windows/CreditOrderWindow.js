// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CreditOrderForm from 'src/pages/credit-order/Forms/CreditOrderForm'

const CreditOrderWindow = ({ onClose, labels, maxAccess, recordId, plantId }) => {
  return (
    <>
      <Window id='CreditOrderWindow' Title={labels[1]} controlled={true} onClose={onClose} width={900} height={600}>
        <CreditOrderForm labels={labels} maxAccess={maxAccess} recordId={recordId} plantId={plantId} />
      </Window>
    </>
  )
}

export default CreditOrderWindow
