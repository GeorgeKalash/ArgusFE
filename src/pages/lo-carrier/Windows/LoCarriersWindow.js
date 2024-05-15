// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import LoCarriersForm from '../forms/LoCarriersForm'

const LoCarriersWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId,
  lookupBusinessPartners,
  businessPartnerStore,
  setBusinessPartnerStore
}) => {
  return (
    <Window id='LoCarriersWindow' Title={labels.carrier} controlled={true} width={500} height={500} onClose={onClose}>
      <LoCarriersForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
        lookupBusinessPartners={lookupBusinessPartners}
        businessPartnerStore={businessPartnerStore}
        setBusinessPartnerStore={setBusinessPartnerStore}
      />
    </Window>
  )
}

export default LoCarriersWindow
