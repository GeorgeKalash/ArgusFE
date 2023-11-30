// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import SourceOfIncomeTab from 'src/pages/source-of-income/Tabs/SourceOfIncomeTab'

const SourceOfIncomeWindow = ({
  onClose,
  width,
  height,
  onSave,
  incomeTypeStore,
  sourceOfIncomeValidation,
  labels,
  maxAccess
}) => {
  return (
    <Window
      id='SourceOfIncomeWindow'
      Title={labels.sourceOfIncome}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
      sourceOfIncomeValidation={sourceOfIncomeValidation}
      incomeTypeStore={incomeTypeStore}
    >
      <CustomTabPanel>
        <SourceOfIncomeTab
          labels={labels}
          sourceOfIncomeValidation={sourceOfIncomeValidation}
          incomeTypeStore={incomeTypeStore}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default SourceOfIncomeWindow
