// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import IdTypesTab from 'src/pages/id-types/Tabs/IdTypesTab'
import IdFieldsTab from 'src/pages/id-types/Tabs/IdFieldsTab'

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
  idtId,
  maxAccess,
  idFieldsGridColumn,
  idFieldsvalidation,
  categoryStore
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
      categoryStore={categoryStore}
      idTypesValidation={idTypesValidation}
    >
      <CustomTabPanel index={0} value={activeTab}>
        <IdTypesTab
          labels={labels}
          idTypesValidation={idTypesValidation}
          categoryStore={categoryStore}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>

      <CustomTabPanel index={1} value={activeTab}>
        <IdFieldsTab
          idFieldsvalidation={idFieldsvalidation}
          idFieldsGridColumn={idFieldsGridColumn}
          idTypesValidation={idTypesValidation}
          maxAccess={maxAccess}
          idtId={idtId}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default IdTypesWindow
