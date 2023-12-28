// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ClientTab from '../Tabs/ClientTab'

const ClientWindow = ({
    onClose,
    onSave,
    clientIndividualFormValidation,
    WorkAddressValidation,
    types,
    countryStore,
    cityStore,
    setCityStore,
    cityAddressStore,
    setCityAddressStore,
    cityAddressWorkStore,
    setCityAddressWorkStore,
    professionStore,
    salaryRangeStore,
    incomeOfSourceStore,
    smsLanguageStore,
    civilStatusStore,
    genderStore,
    fillStateStoreAddress,
    fillStateStoreAddressWork,
    stateAddressWorkStore,
    stateAddressStore,
    educationStore,
    idTypeStore,
    titleStore,
    lookupCityDistrictAddress,
    lookupCityDistrictAddressWork,
    cityDistrictAddressWorkStore,
    cityDistrictAddressStore,
     lookupCity,
    lookupCityAddress,
    lookupCityAddressWork,
    width,
    height,
    _labels,
    editMode,
    maxAccess
}) => {

  console.log(cityAddressStore)
  console.log(cityAddressWorkStore)


return (
        <Window id='CountryWindow' Title={_labels.country} onClose={onClose} width={width} height={height}
         onSave={onSave}>
            <CustomTabPanel>
                <ClientTab
                    clientIndividualFormValidation={clientIndividualFormValidation}
                    WorkAddressValidation={WorkAddressValidation}

                    types={types}
                    countryStore={countryStore}
                    cityStore={cityStore}
                    setCityStore={setCityStore}
                    cityAddressStore={cityAddressStore}
                    cityAddressWorkStore={cityAddressWorkStore}
                    lookupCityDistrictAddress={lookupCityDistrictAddress}
                    lookupCityDistrictAddressWork={lookupCityDistrictAddressWork}
                    professionStore={professionStore}
                    salaryRangeStore={salaryRangeStore}
                    incomeOfSourceStore={incomeOfSourceStore}
                    smsLanguageStore={smsLanguageStore}
                    civilStatusStore={civilStatusStore}
                    genderStore={genderStore}
                    fillStateStoreAddress={fillStateStoreAddress}
                    fillStateStoreAddressWork={fillStateStoreAddressWork}
                    stateAddressWorkStore={stateAddressWorkStore}
                    stateAddressStore={stateAddressStore}
                    educationStore={educationStore}
                    idTypeStore={idTypeStore}
                    titleStore={titleStore}
                    cityStoreAddressWork={cityAddressWorkStore}
                    setCityAddressWorkStore={setCityAddressWorkStore}
                    setCityAddressStore={setCityAddressStore}
                    lookupCity={lookupCity}
                    lookupCityAddress={lookupCityAddress}
                    lookupCityAddressWork={lookupCityAddressWork}
                    cityDistrictAddressWorkStore={cityDistrictAddressWorkStore}
                    cityDistrictAddressStore={cityDistrictAddressStore}
                    _labels={_labels}
                    maxAccess={maxAccess}
                    editMode={editMode}
                />
            </CustomTabPanel>
        </Window>
    )
}


export default ClientWindow
