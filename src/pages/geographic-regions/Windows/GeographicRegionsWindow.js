// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GeographicRegionsTab from 'src/pages/geographic-regions/Tabs/GeographicRegionsTab'

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
  return (
    <Window
      id='GeographicRegionsWindow'
      Title={labels.geographicRegion}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
      geographicRegionsValidation={geographicRegionsValidation}
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
  )
}

export default GeographicRegionsWindow
