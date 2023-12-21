// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GeneralTab from 'src/pages/bp-master-data/Tabs/GeneralTab'
import IDNumberTab from 'src/pages/bp-master-data/Tabs/IDNumberTab'

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
  idNumberGridColumn
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
      categoryStore={categoryStore}
      groupStore={groupStore}
      countryStore={countryStore}
      legalStatusStore={legalStatusStore}
      idCategoryStore={idCategoryStore}
      bpMasterDataValidation={bpMasterDataValidation}
      idNumberGridColumn={idNumberGridColumn}
      idNumberValidation={idNumberValidation}
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
          editMode={editMode}
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
    </Window>
  )
}

export default BPMasterDataWindow
