// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CbCashGroupsForm from '../forms/CbCashGroupsForm'

const CbCashGroupsWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='CbCashGroupsWindow'
      Title={labels.accountGroup}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <CbCashGroupsForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
      />
    </Window>
  )
}

export default CbCashGroupsWindow
