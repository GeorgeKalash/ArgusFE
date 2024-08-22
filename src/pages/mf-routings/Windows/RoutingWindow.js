import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import RoutingForm from '../forms/RoutingForm'
import RoutingSeqForm from '../forms/RoutingSeqForm'

const RoutingWindow = ({
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
    <Window
      id='routing'
      Title={labels.routing}
      controlled={true}
      onClose={onClose}
      tabs={tabs}
      width={600}
      height={500}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <CustomTabPanel index={0} value={activeTab}>
        <RoutingForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
          setErrorMessage={setErrorMessage}
          editMode={editMode}
          setEditMode={setEditMode}
          setSelectedRecordId={setSelectedRecordId}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <RoutingSeqForm
          labels={labels}
          setErrorMessage={setErrorMessage}
          maxAccess={maxAccess}
          recordId={recordId}
          setSelectedRecordId={setSelectedRecordId}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default RoutingWindow
