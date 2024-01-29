// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import ExpenseTypesForm from '../forms/ExpenseTypesForm'

const ExpenseTypesWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='ExpenseTypesWindow'
      Title={labels.expenseType}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <CustomTabPanel>
        <ExpenseTypesForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />       
      </CustomTabPanel>
    </Window>
  )
}

export default ExpenseTypesWindow
