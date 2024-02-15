// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import LoCarriersForm from '../forms/LoCarriersForm'

const LoCarriersWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='LoCarriersWindow'
      Title={labels.carrier}
      controlled={true}
      onClose={onClose}
      width={500}
      height={450}
    >
      <CustomTabPanel>
        <LoCarriersForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
       
      </CustomTabPanel>
    </Window>
  )
}

export default LoCarriersWindow
