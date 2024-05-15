// ** Custom Imports
import Window from 'src/components/Shared/Window'
import ExpenseTypesForm from '../Forms/ExpenseTypesForm'

const ExpenseTypesWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='ExpenseTypesWindow' Title={labels.expenseType} controlled={true} onClose={onClose}>
      <ExpenseTypesForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default ExpenseTypesWindow
