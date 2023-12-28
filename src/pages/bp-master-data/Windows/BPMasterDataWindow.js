// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GeneralTab from 'src/pages/bp-master-data/Tabs/GeneralTab'
import IDNumberTab from 'src/pages/bp-master-data/Tabs/IDNumberTab'
import RelationTab from 'src/pages/bp-master-data/Tabs/RelationTab'

const BPMasterDataWindow = ({
  onClose,
  width,
  height,
  tabs,
  activeTab,
  setActiveTab,
  onSave,
  bpMasterDataValidation,
  labels,
  maxAccess,
  categoryStore,
  groupStore,
  idCategoryStore,
  countryStore,
  legalStatusStore,
  editMode,
  idNumberValidation,
  idNumberGridColumn,
  fillIdCategoryStore,
  relationGridData,
  getRelationGridData,
  addRelation,
  delRelation,
  defaultValue,
  popupRelation
}) => {
  return (
    <Window
      id='BPMasterDataWindow'
      Title={labels.masterData}
      tabs={tabs}
      activeTab={activeTab}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
      setActiveTab={setActiveTab}
    >
      <CustomTabPanel index={0} value={activeTab}>
        <GeneralTab
          labels={labels}
          bpMasterDataValidation={bpMasterDataValidation}
          categoryStore={categoryStore}
          maxAccess={maxAccess}
          groupStore={groupStore}
          countryStore={countryStore}
          legalStatusStore={legalStatusStore}
          idCategoryStore={idCategoryStore}
          fillIdCategoryStore={fillIdCategoryStore}
          editMode={editMode}
          defaultValue={defaultValue}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <IDNumberTab
          bpMasterDataValidation={bpMasterDataValidation}
          idNumberValidation={idNumberValidation}
          idNumberGridColumn={idNumberGridColumn}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <RelationTab
          relationGridData={relationGridData}
          getRelationGridData={getRelationGridData}
          addRelation={addRelation}
          delRelation={delRelation}
          popupRelation={popupRelation}
          labels={labels}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default BPMasterDataWindow
