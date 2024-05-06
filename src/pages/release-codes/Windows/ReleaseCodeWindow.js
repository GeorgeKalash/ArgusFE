// ** Custom Imports
import Window from 'src/components/Shared/Window'

// **Tabs
import ReleaseCodeForm from 'src/pages/release-codes/forms/ReleaseCodeForm'

const ReleaseCodeWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='ReleaseCodeWindow' Title={labels.releaseCode} controlled={true} onClose={onClose}>
      <ReleaseCodeForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default ReleaseCodeWindow
