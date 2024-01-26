// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ReleaseIndicatorForm from 'src/pages/release-indicators/forms/ReleaseIndicatorForm'

const ReleaseIndicatorWindow = ({
    onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='ReleaseIndicatorWindow'
      Title={labels.releaseIndicator}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <CustomTabPanel>
        <ReleaseIndicatorForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
       
      </CustomTabPanel>
    </Window>
  )
}


export default ReleaseIndicatorWindow
