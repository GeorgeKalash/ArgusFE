// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import ChartOfAccountsForm from '../forms/ChartOfAccountsForm'

const ChartOfAccountsWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='ChartOfAccountsWindow' Title={labels.chartOfAccount} controlled={true} onClose={onClose} width={500}>
      <ChartOfAccountsForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default ChartOfAccountsWindow
