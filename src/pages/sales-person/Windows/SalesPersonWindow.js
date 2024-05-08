// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GeneralForm from 'src/pages/sales-person/Forms/GeneralForm'
import TargetForm from 'src/pages/sales-person/Forms/TargetForm'
import MonthlyTargetForm from '../Forms/MonthlyTargetForm'

const SalesPersonWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId,
  setErrorMessage,
  tabs,
  editMode,
  setEditMode,
  setSelectedRecordId,
  activeTab,
  setActiveTab
}) => {
  return (
      <Window
        id='SalesPerson'
        Title={labels[1]}
        onClose={onClose}
        tabs={tabs}
        width={600}
        height={500}
        controlled={true}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        <CustomTabPanel index={0} value={activeTab}>
          <GeneralForm
            editMode={editMode}
            setEditMode={setEditMode}
            labels={labels}
            maxAccess={maxAccess}
            setErrorMessage={setErrorMessage}
            setSelectedRecordId={setSelectedRecordId}
            recordId={recordId}
          />
        </CustomTabPanel>

        <CustomTabPanel index={1} value={activeTab}>
          <TargetForm labels={labels} setErrorMessage={setErrorMessage} maxAccess={maxAccess} recordId={recordId} />
        </CustomTabPanel>
        <CustomTabPanel index={2} value={activeTab}>
          <MonthlyTargetForm
            labels={labels}
            setErrorMessage={setErrorMessage}
            maxAccess={maxAccess}
            recordId={recordId}
          />
        </CustomTabPanel>
      </Window>
  )
}

export default SalesPersonWindow
