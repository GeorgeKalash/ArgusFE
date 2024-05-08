// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GroupLegalDocumentForm from 'src/pages/group-legal-document/forms/GroupLegalDocumentForm'

const GroupLegalDocumentWindow = ({ onClose, labels, maxAccess, recordId, groupId, incId }) => {
  return (
    <Window
      id='GroupLegalDocumentWindow'
      Title={labels.groupLegalDocument}
      controlled={true}
      height={400}
      width={600}
      onClose={onClose}
    >
      <CustomTabPanel>
        <GroupLegalDocumentForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
          groupId={groupId}
          incId={incId}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default GroupLegalDocumentWindow
