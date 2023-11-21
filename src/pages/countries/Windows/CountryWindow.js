// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import CountryTab from 'src/pages/countries/Tabs/countryTab'

const CountryWindow = ({
    onClose,
    onSave,
    tabs,
    activeTab,
    setActiveTab,
    countryValidation,
    currencyStore,
    regionStore,
    width,
    height,
    _labels,
    maxAccess
}) => {
    return (
        <Window id='CountryWindow' Title={_labels.country} onClose={onClose} width={width} height={height} 
         onSave={onSave} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}>
            <CustomTabPanel index={0} value={activeTab}>
                <CountryTab
                    countryValidation={countryValidation}
                    currencyStore={currencyStore}
                    regionStore={regionStore}
                    _labels={_labels}
                    maxAccess={maxAccess}
                />
            </CustomTabPanel>
        </Window>
    )
}


export default CountryWindow
