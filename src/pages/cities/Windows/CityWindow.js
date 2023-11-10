// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CityTab from 'src/pages/cities/Tabs/CityTab'

const CityWindow = ({
    onClose,
    width,
    height,
    onSave,
    editMode,
    stateStore,
    countryStore,
    cityValidation,
    fillStateStore,
    labels
}) => {
    return (
        <Window
        id='CityWindow'
        Title={labels.cities}
        onClose={onClose}
        width={width}
        height={height}
        onSave={onSave}
        cityValidation={cityValidation}
        countryStore={countryStore}
        stateStore={stateStore}
        >
            <CustomTabPanel>
               <CityTab
                  labels={labels}
                  cityValidation={cityValidation}
                  countryStore={countryStore}
                  stateStore={stateStore}
                  editMode={editMode}
                  fillStateStore={fillStateStore}
               />
            </CustomTabPanel>
        </Window>
    )
}

export default CityWindow