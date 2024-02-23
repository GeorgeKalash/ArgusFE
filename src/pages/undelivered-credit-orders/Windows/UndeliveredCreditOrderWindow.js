// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import UndeliveredCreditOrderForm from 'src/pages/undelivered-credit-orders/Forms/UndeliveredCreditOrderForm'

const UndeliveredCreditOrderWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <>
      <Window
        id='UndeliveredCreditOrderWindow'
        Title={labels[1]}
        controlled={true}
        onClose={onClose}
        width={900}
        height={600}
      >
        <UndeliveredCreditOrderForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
      </Window>
    </>
  )
}

export default UndeliveredCreditOrderWindow
