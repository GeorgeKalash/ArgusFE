// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ReleaseIndicatorTab from 'src/pages/release-indicators/Tabs/ReleaseIndicatorTab'

const ReleaseIndicatorWindow = ({
    onClose,
    onSave,
    releaseIndValidation,
    changeabilityStore,
    width,
    height,
    _labels,
    editMode,
    maxAccess
}) => {
    return (
        <Window id='PlantWindow' Title={_labels.releaseInd} onClose={onClose} width={width} height={height} 
         onSave={onSave}>
            <CustomTabPanel>
                <ReleaseIndicatorTab
                    releaseIndValidation={releaseIndValidation}
                    changeabilityStore={changeabilityStore}
                    _labels={_labels}
                    maxAccess={maxAccess}
                    editMode={editMode}
                />
            </CustomTabPanel>
        </Window>
    )
}


export default ReleaseIndicatorWindow
