// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CreditInvoiceForm from 'src/pages/credit-invoice/Forms/CreditInvoiceForm'

const CreditInvoiceWindow = ({ onClose, labels, maxAccess, recordId, plantId }) => {
  return (
    <>
      <Window id='CreditInvoiceWindow' Title={labels[1]} controlled={true} onClose={onClose} width={900} height={600}>
        <CreditInvoiceForm labels={labels} maxAccess={maxAccess} recordId={recordId} plantId={plantId} />
      </Window>
    </>
  )
}

export default CreditInvoiceWindow
