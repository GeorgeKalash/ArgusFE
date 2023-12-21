// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import BPBusinessPartnerTab from 'src/pages/bp-master-data/Tabs/BPMasterDataTab'

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
  editMode
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
    >
      <CustomTabPanel index={0} value={activeTab}>
        <BPBusinessPartnerTab
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
    </Window>
  )
}

export default BPMasterDataWindow
