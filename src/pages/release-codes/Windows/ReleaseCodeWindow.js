// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ReleaseCodeTab from 'src/pages/release-codes/Tabs/ReleaseCodeTab'

const ReleaseCodeWindow = ({
    onClose,
    onSave,
    releaseCodeValidation,
    width,
    height,
    _labels,
    editMode,
    maxAccess
}) => {
    return (
        <Window id='PlantWindow' Title={_labels.releaseCode} onClose={onClose} width={width} height={height} 
         onSave={onSave}>
            <CustomTabPanel>
                <ReleaseCodeTab
                    releaseCodeValidation={releaseCodeValidation}
                    _labels={_labels}
                    maxAccess={maxAccess}
                    editMode={editMode}
                />
            </CustomTabPanel>
        </Window>
    )
}


export default ReleaseCodeWindow
