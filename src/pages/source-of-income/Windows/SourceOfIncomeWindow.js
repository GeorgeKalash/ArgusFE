// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import SourceOfIncomeTab from 'src/pages/source-of-income/Tabs/SourceOfIncomeTab'
import TransactionLog from 'src/components/Shared/TransactionLog'
import { useState } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'
import { editingStateInitializer } from '@mui/x-data-grid/internals'

const SourceOfIncomeWindow = ({
  onClose,
  width,
  height,
  onSave,
  incomeTypeStore,
  sourceOfIncomeValidation,
  labels,
  maxAccess,
  editMode
}) => {
  const [windowInfo, setWindowInfo] = useState(null)

  return (
    <>
      <Window
        id='SourceOfIncomeWindow'
        Title={labels.sourceOfIncome}
        onClose={onClose}
        width={width}
        height={height}
        onSave={onSave}
        sourceOfIncomeValidation={sourceOfIncomeValidation}
        incomeTypeStore={incomeTypeStore}
        onInfo={() => setWindowInfo(true)}
        disabledInfo={!editMode && true}
        onInfoClose={() => setWindowInfo(false)}
      >
        <CustomTabPanel>
          <SourceOfIncomeTab
            labels={labels}
            sourceOfIncomeValidation={sourceOfIncomeValidation}
            incomeTypeStore={incomeTypeStore}
            maxAccess={maxAccess}
            editMode={editMode}
          />
        </CustomTabPanel>
      </Window>
      {windowInfo && (
        <TransactionLog
          resourceId={ResourceIds && ResourceIds.SourceOfIncome}
          recordId={sourceOfIncomeValidation.values.recordId}
          onInfoClose={() => setWindowInfo(false)}
        />
      )}
    </>
  )
}

export default SourceOfIncomeWindow
