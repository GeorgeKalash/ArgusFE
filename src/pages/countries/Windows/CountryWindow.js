// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import CountryTab from 'src/pages/countries/Tabs/countryTab'

const CountryWindow = ({
    onClose,
    onSave,
    countryValidation,
    currencyStore,
    regionStore,
    width,
    height,
    _labels,
    editMode,
    maxAccess
}) => {
    return (
        <Window id='CountryWindow' Title={_labels.country} onClose={onClose} width={width} height={height} 
         onSave={onSave}>
            <CustomTabPanel>
                <CountryTab
                    countryValidation={countryValidation}
                    currencyStore={currencyStore}
                    regionStore={regionStore}
                    _labels={_labels}
                    maxAccess={maxAccess}
                    editMode={editMode}
                />
            </CustomTabPanel>
        </Window>
    )
}


export default CountryWindow
