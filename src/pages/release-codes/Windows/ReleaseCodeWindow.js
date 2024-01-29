// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ReleaseCodeForm from 'src/pages/release-codes/forms/ReleaseCodeForm'

const ReleaseCodeWindow = ({
    onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='ReleaseCodeWindow'
      Title={labels.releaseCode}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <CustomTabPanel>
        <ReleaseCodeForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
       
      </CustomTabPanel>
    </Window>
  )
}

export default ReleaseCodeWindow
