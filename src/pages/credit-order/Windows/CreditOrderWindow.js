// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CreditOrderForm from 'src/pages/credit-order/Forms/CreditOrderForm'

const CreditOrderWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <>
      <Window id='CreditOrderWindow' Title={labels[1]} controlled={true} onClose={onClose} width={900} height={600}>
        <CustomTabPanel>
          <CreditOrderForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
        </CustomTabPanel>
      </Window>
    </>
  )
}

export default CreditOrderWindow
