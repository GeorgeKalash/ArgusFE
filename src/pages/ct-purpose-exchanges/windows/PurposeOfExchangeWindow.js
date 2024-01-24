// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import PurposeOfExchangeForm from '../forms/PurposeOfExchangeForm'

const PurposeOfExchangeWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='PurposeOfExchangeWindow'
      Title={labels.purposeOfExchange}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <CustomTabPanel>
      <PurposeOfExchangeForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default PurposeOfExchangeWindow
