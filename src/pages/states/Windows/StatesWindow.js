// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import StatesTab from 'src/pages/states/Tabs/StatesTab'
import TransactionLog from 'src/components/Shared/TransactionLog'
import { useState } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'

const StatesWindow = ({
  onClose,
  width,
  height,
  onSave,
  statesValidation,
  labels,
  maxAccess,
  countryStore,
  editMode
}) => {
  const [windowInfo, setWindowInfo] = useState(null)

  return (
    <>
    <Window
      id='StatesWindow'
      Title={labels.states}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
      onInfo={() => setWindowInfo(true)}
      disabledInfo={!editMode && true}
      onInfoClose={() => setWindowInfo(false)}
    >
      <CustomTabPanel>
        <StatesTab
          labels={labels}
          statesValidation={statesValidation}
          maxAccess={maxAccess}
          countryStore={countryStore}
          editMode={editMode}
        />
      </CustomTabPanel>
      </Window>
        {windowInfo && (
        <TransactionLog
          resourceId={ResourceIds && ResourceIds.States}
          recordId={statesValidation.values.recordId}
          onInfoClose={() => setWindowInfo(false)}
        />
      )}
    </>
  )
}

export default StatesWindow
