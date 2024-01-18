// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GeographicRegionsTab from 'src/pages/geographic-regions/Tabs/GeographicRegionsTab'
import TransactionLog from 'src/components/Shared/TransactionLog'
import { useState } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'

const GeographicRegionsWindow = ({
  onClose,
  width,
  height,
  onSave,
  editMode,
  geographicRegionsValidation,
  labels,
  maxAccess
}) => {
  const [windowInfo, setWindowInfo] = useState(null)

  return (
    <>
    <Window
      id='GeographicRegionsWindow'
      Title={labels.geographicRegion}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
      geographicRegionsValidation={geographicRegionsValidation}
      onInfo={() => setWindowInfo(true)}
      disabledInfo={!editMode && true}
      onInfoClose={() => setWindowInfo(false)}
    >
      <CustomTabPanel>
        <GeographicRegionsTab
          labels={labels}
          geographicRegionsValidation={geographicRegionsValidation}
          editMode={editMode}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      </Window>
        {windowInfo && (
        <TransactionLog
          resourceId={ResourceIds && ResourceIds.GeographicRegions}
          recordId={geographicRegionsValidation.values.recordId}
          onInfoClose={() => setWindowInfo(false)}
        />
      )}
    </>
  )
}

export default GeographicRegionsWindow
