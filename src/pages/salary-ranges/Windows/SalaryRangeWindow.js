// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import SalaryRangeForm from 'src/pages/salary-ranges/Tabs/SalaryRangeForm'

const SalaryRangeWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {

  return (
    <>
      <Window
        id='SalaryRangeWindow'
        Title={labels[1]}
        controlled={true}
        onClose={onClose}
        width={500}
        height={300}
      >
        <CustomTabPanel>
          <SalaryRangeForm
            labels={labels}
            maxAccess={maxAccess}
            recordId={recordId}
          />
        </CustomTabPanel>
      </Window>
    </>
  )
}

export default SalaryRangeWindow
