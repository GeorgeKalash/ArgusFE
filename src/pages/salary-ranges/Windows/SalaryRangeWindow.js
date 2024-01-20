// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import SalaryRangeTab from 'src/pages/salary-ranges/Tabs/SalaryRangeTab'
import TransactionLog from 'src/components/Shared/TransactionLog'
import { useState } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'

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
}) => {
  const [windowInfo, setWindowInfo] = useState(null)

  return (
    <>
      <Window
        id='SalaryRangeWindow'
        Title={labels.SalaryRange}
        onClose={onClose}
        width={width}
        height={height}
        onSave={onSave}
        salaryRangeValidation={salaryRangeValidation}
        typeStore={typeStore}
        onInfo={() => setWindowInfo(true)}
        disabledInfo={!editMode && true}
        onInfoClose={() => setWindowInfo(false)}
      >
        <CustomTabPanel>
          <SalaryRangeTab
            labels={labels}
            salaryRangeValidation={salaryRangeValidation}
            typeStore={typeStore}
            maxAccess={maxAccess}
            editMode={editMode}
          />
        </CustomTabPanel>
      </Window>
      {windowInfo && (
        <TransactionLog
          resourceId={ResourceIds && ResourceIds.SalaryRange}
          recordId={salaryRangeValidation.values.recordId}
          onInfoClose={() => setWindowInfo(false)}
        />
      )}
    </>
  )
}

export default SalaryRangeWindow
