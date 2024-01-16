// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import ProfessionTab from 'src/pages/profession/Tabs/ProfessionTab'
import TransactionLog from 'src/components/Shared/TransactionLog'
import { useState } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'

const ProfessionWindow = ({
  onClose,
  width,
  height,
  onSave,
  diplomatStore,
  ProfessionValidation,
  labels,
  maxAccess,
  editMode
}) => {
  const [windowInfo, setWindowInfo] = useState(null)

  return (
    <>
      <Window
        id='RelationWindow'
        Title={labels.profession}
        onClose={onClose}
        width={width}
        height={height}
        onSave={onSave}
        ProfessionValidation={ProfessionValidation}
        onInfo={() => setWindowInfo(true)}
        disabledInfo={!editMode && true}
        onInfoClose={() => setWindowInfo(false)}
      >
        <CustomTabPanel>
          <ProfessionTab
            labels={labels}
            ProfessionValidation={ProfessionValidation}
            diplomatStore={diplomatStore}
            maxAccess={maxAccess}
            editMode={editMode}
          />
        </CustomTabPanel>
      </Window>
      {windowInfo && (
        <TransactionLog
          resourceId={ResourceIds && ResourceIds.Profession}
          recordId={ProfessionValidation.values.recordId}
          onInfoClose={() => setWindowInfo(false)}
        />
      )}
    </>
  )
}

export default ProfessionWindow
