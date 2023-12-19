// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import PlantTab from 'src/pages/plants/Tabs/PlantTab'

const PlantWindow = ({
    onClose,
    onSave,
    plantValidation,
    costCenterStore,
    plantGroupStore,
    segmentStore,
    width,
    height,
    _labels,
    editMode,
    maxAccess
}) => {
    return (
        <Window id='PlantWindow' Title={_labels.plant} onClose={onClose} width={width} height={height} 
         onSave={onSave}>
            <CustomTabPanel>
                <PlantTab
                    plantValidation={plantValidation}
                    costCenterStore={costCenterStore}
                    plantGroupStore={plantGroupStore}
                    segmentStore={segmentStore}
                    _labels={_labels}
                    maxAccess={maxAccess}
                    editMode={editMode}
                />
            </CustomTabPanel>
        </Window>
    )
}


export default PlantWindow
