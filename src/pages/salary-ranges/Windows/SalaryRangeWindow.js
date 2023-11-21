// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import SalaryRangeTab from 'src/pages/salary-ranges/Tabs/SalaryRangeTab'

const SalaryRangeWindow = ({
    onClose,
    width,
    height,
    onSave,
    editMode,
    typeStore,
    salaryRangeValidation,
    labels,
    maxAccess
}) => {return (
    <Window
    id='SalaryRangeWindow'
    Title={labels.SalaryRange}
    onClose={onClose}
    width={width}
    height={height}
    onSave={onSave}
    salaryRangeValidation={salaryRangeValidation}
    typeStore={typeStore}
    >
         <CustomTabPanel>
           <SalaryRangeTab
              labels={labels}
              salaryRangeValidation={salaryRangeValidation}
              typeStore={typeStore}
              maxAccess={maxAccess}
           />
           </CustomTabPanel>
        </Window>
     )
}

export default SalaryRangeWindow
