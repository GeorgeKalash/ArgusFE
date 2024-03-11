// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CbBanksForm from '../forms/CbBanksForm'

const CbBanksWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='CbBanksWindow'
      Title={labels.bank}
      controlled={true}
      onClose={onClose}
      width={500}
      height={350}
    >
      <CbBanksForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
      />
    </Window>
  )
}

export default CbBanksWindow
