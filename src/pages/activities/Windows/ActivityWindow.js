// ** Custom Imports
import Window from 'src/components/Shared/Window'

import  ActivityForm from '../forms/ActivityForm'

const ActivityWindow = ({
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
      height={430}
    >
        <ActivityForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
    </Window>
  )
}





export default ActivityWindow





