// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import SalaryRangeForm from 'src/pages/salary-ranges/forms/SalaryRangeForm'

const SalaryRangeWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <>
      <Window id='SalaryRangeWindow' Title={labels.salaryRange} controlled={true} onClose={onClose} width={500}>
        <SalaryRangeForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
      </Window>
    </>
  )
}

export default SalaryRangeWindow
