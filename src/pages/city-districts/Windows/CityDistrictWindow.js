// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import CityDistrictTab from 'src/pages/city-districts/Tabs/CityDistrictTab'

const CityDistrictWindow = ({
    onClose,
    onSave,
    cityDistrictValidation,
    countryStore,
    cityStore,
    setCityStore,
    lookupCity,
    width,
    height,
    _labels,
    editMode,
    maxAccess
}) => {
    return (
        <Window id='CityDistrictWindow' Title={_labels.cityDistrict} onClose={onClose} width={width} height={height} 
         onSave={onSave}>
            <CustomTabPanel>
                <CityDistrictTab
                    cityDistrictValidation={cityDistrictValidation}
                    countryStore={countryStore}
                    cityStore={cityStore}
                    setCityStore={setCityStore}
                    lookupCity={lookupCity}
                    _labels={_labels}
                    maxAccess={maxAccess}
                    editMode={editMode}
                />
            </CustomTabPanel>
        </Window>
    )
}


export default CityDistrictWindow
