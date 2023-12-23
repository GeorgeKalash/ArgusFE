// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import DRGroupTab from 'src/pages/dr-groups/Tabs/DRGroupTab'
import ApproverTab from 'src/pages/dr-groups/Tabs/ApproverTab'

const DRGroupWindow = ({
  onClose,
  onSave,
  drGroupValidation,
  width,
  height,
  _labels,
  editMode,
  maxAccess,
  tabs,
  activeTab,
  setActiveTab,

  //approver tab
  approverGridData,
  getApproverGridData,
  addApprover,
  delApprover,
  editApprover
}) => {
  return (
    <Window id='DRGroupWindow' Title={_labels.group} onClose={onClose} width={width} height={height} onSave={onSave} tabs={tabs}
    activeTab={activeTab}
    setActiveTab={setActiveTab}>
      <CustomTabPanel index={0} value={activeTab}>
        <DRGroupTab drGroupValidation={drGroupValidation} _labels={_labels} maxAccess={maxAccess} editMode={editMode} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
       <ApproverTab
          approverGridData={approverGridData}
          getApproverGridData={getApproverGridData}
          addApprover={addApprover}
          delApprover={delApprover}
          editApprover={editApprover}
          maxAccess={maxAccess}
          _labels={_labels}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default DRGroupWindow
