// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import IdTypesTab from 'src/pages/id-types/Tabs/IdTypesTab'

const IdTypesWindow = ({
  onClose,
  width,
  height,
  tabs,
  activeTab,
  setActiveTab,
  onSave,
  idTypesValidation,
  labels,
  maxAccess
}) => {
  return (
    <Window
      id='IdTypesWindow'
      Title={labels.IdTypes}
      tabs={tabs}
      activeTab={activeTab}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
      setActiveTab={setActiveTab}
      idTypesValidation={idTypesValidation}
    >
      <CustomTabPanel index={0} value={activeTab}>
        <IdTypesTab labels={labels} idTypesValidation={idTypesValidation} maxAccess={maxAccess} />
      </CustomTabPanel>

      <CustomTabPanel index={1} value={activeTab}>
        Second Tab
      </CustomTabPanel>
    </Window>
  )
}

export default IdTypesWindow
