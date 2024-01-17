// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ActivityTab from 'src/pages/activities/Tabs/ActivityTab'
import TransactionLog from 'src/components/Shared/TransactionLog'
import { useState } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'

const ActivityWindow = ({
  onClose,
  onSave,
  activityValidation,
  industryStore,
  width,
  height,
  _labels,
  editMode,
  maxAccess
}) => {
  const [windowInfo, setWindowInfo] = useState(null)

  return (
    <>
      <Window
        id='ActivityWindow'
        Title={_labels.activity}
        onClose={onClose}
        width={width}
        height={height}
        onSave={onSave}
        onInfo={() => setWindowInfo(true)}
        disabledInfo={!editMode && true}
        onInfoClose={() => setWindowInfo(false)}
      >
        <CustomTabPanel>
          <ActivityTab
            activityValidation={activityValidation}
            industryStore={industryStore}
            _labels={_labels}
            maxAccess={maxAccess}
            editMode={editMode}
          />
        </CustomTabPanel>
      </Window>
      {windowInfo && (
        <TransactionLog
          resourceId={ResourceIds && ResourceIds.Activity}
          recordId={activityValidation.values.recordId}
          onInfoClose={() => setWindowInfo(false)}
        />
      )}
    </>
  )
}

export default ActivityWindow
