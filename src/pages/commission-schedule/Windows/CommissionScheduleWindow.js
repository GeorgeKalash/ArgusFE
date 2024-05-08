// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import ScheduleForm from 'src/pages/commission-schedule/Forms/ScheduleForm'
import BracketsForm from 'src/pages/commission-schedule/Forms/BracketsForm'

const CommissionScheduleWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId,
  setErrorMessage,
  tabs,
  activeTab,
  setActiveTab,
  editMode,
  setEditMode,
  setSelectedRecordId
}) => {
  return (
    <>
      <Window
        id='CommissionSchedule'
        Title={labels[1]}
        controlled={true}
        onClose={onClose}
        width={600}
        height={500}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        <CustomTabPanel index={0} value={activeTab}>
          <ScheduleForm
            labels={labels}
            maxAccess={maxAccess}
            setErrorMessage={setErrorMessage}
            recordId={recordId}
            editMode={editMode}
            setEditMode={setEditMode}
            setSelectedRecordId={setSelectedRecordId}
          />
        </CustomTabPanel>

        <CustomTabPanel index={1} value={activeTab}>
          <BracketsForm
            labels={labels}
            setErrorMessage={setErrorMessage}
            maxAccess={maxAccess}
            recordId={recordId}
            setSelectedRecordId={setSelectedRecordId}
          />
        </CustomTabPanel>
      </Window>
    </>
  )
}

export default CommissionScheduleWindow
