// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ReleaseIndicatorForm from 'src/pages/release-indicators/forms/ReleaseIndicatorForm'

const ReleaseIndicatorWindow = ({
    onClose,
  labels,
  maxAccess,
  recordId,
  setWindowOpen
}) => {
  
  return (
    <Window
      id='ReleaseIndicatorWindow'
      Title={labels.releaseIndicator}
      controlled={true}
      onClose={onClose}
      width={600}
      height={450}
    >
      <CustomTabPanel>
        <ReleaseIndicatorForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
          setWindowOpen={setWindowOpen}
        />
       
      </CustomTabPanel>
    </Window>
  )
}


export default ReleaseIndicatorWindow
