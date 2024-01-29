import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GlIntegrationForm from '../forms/GlIntegrationForm'

const CtRiskLevelsWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='GlIntegrationWindow'
      Title={labels.postType}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <CustomTabPanel>
        <GlIntegrationForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
       
      </CustomTabPanel>
    </Window>
  )
}

export default CtRiskLevelsWindow
