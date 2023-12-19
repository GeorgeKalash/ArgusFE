// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ActivityTab from 'src/pages/activities/Tabs/ActivityTab'

const ActivityWindow = ({
    onClose,
    onSave,
    activityValidation,
    industryStore,
    width,
    height,
    _labels,
    editMode,
    maxAccess
}) => {
    return (
        <Window id='ActivityWindow' Title={_labels.activity} onClose={onClose} width={width} height={height} 
         onSave={onSave}>
            <CustomTabPanel>
                <ActivityTab
                    activityValidation={activityValidation}
                    industryStore={industryStore}
                    _labels={_labels}
                    maxAccess={maxAccess}
                    editMode={editMode}
                />
            </CustomTabPanel>
        </Window>
    )
}


export default ActivityWindow
