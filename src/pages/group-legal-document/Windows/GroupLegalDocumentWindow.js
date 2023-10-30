// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GroupLegalDocumentTab from 'src/pages/group-legal-document/Tabs/GroupLegalDocumentTab'

const GroupLegalDocumentWindow = ({
    onClose,
    width,
    height,
    onSave,
    groupLegalDocumentValidation,
    groupStore,
    categoryStore,
    labels,
    editMode
}) => {
    return (
        <Window
        id='GroupLegalDocumentWindow'
        Title={labels.groupLegalDocument}
        onClose={onClose}
        width={width}
        height={height}
        onSave={onSave}
        groupLegalDocumentValidation={groupLegalDocumentValidation}
        categoryStore={categoryStore}
        groupStore={groupStore}
        >
          <CustomTabPanel>
               <GroupLegalDocumentTab
                  labels={labels}
                  groupLegalDocumentValidation={groupLegalDocumentValidation}
                  categoryStore={categoryStore}
                  groupStore={groupStore}
                  editMode={editMode}
               />
          </CustomTabPanel>
        </Window>
    )
}

export default GroupLegalDocumentWindow