// ** Custom Imports
import Window from 'src/components/Shared/Window'

import  SourceOfIncomeForm from '../forms/sourceOfIncomeForm'

const SourceOfIncomeWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
    id='SourceOfIncomeWindow'
    Title={labels.sourceOfIncome}
      controlled={true}
      onClose={onClose}
      width={500}
      height={400}
    >
        <SourceOfIncomeForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
    </Window>
  )
}


export default SourceOfIncomeWindow
