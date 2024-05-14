// ** Custom Imports
import Window from 'src/components/Shared/Window'

// **Tabs
import ReleaseIndicatorForm from 'src/pages/release-indicators/forms/ReleaseIndicatorForm'

const ReleaseIndicatorWindow = ({ onClose, labels, maxAccess, recordId, setWindowOpen }) => {
  return (
    <Window id='ReleaseIndicatorWindow' Title={labels.releaseIndicator} width={500}
    height={450} controlled={true} onClose={onClose}>
      <ReleaseIndicatorForm labels={labels} maxAccess={maxAccess} recordId={recordId} setWindowOpen={setWindowOpen} />
    </Window>
  )
}

export default ReleaseIndicatorWindow
