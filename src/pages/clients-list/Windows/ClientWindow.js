// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Forms
import ClientTemplateForm from '../forms/ClientTemplateForm'

const ClientWindow = ({
  recordId,
  setErrorMessage,
  setSelectedRecordId,
    onClose,
    _labels,
    editMode,
    maxAccess
}) => {


     return (

                <ClientTemplateForm
                    _labels={_labels}
                    maxAccess={maxAccess}
                    editMode={editMode}
                    setErrorMessage={setErrorMessage}
                    recordId={recordId}
                    setSelectedRecordId={setSelectedRecordId}
                />

    )

}

export default ClientWindow
