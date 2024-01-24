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
    requiredOptional,
    types,
    countryStore,
    cityStore,
    setCityStore,
    cityAddressStore,
    setCityAddressStore,
    cityAddressWorkStore,
    setCityAddressWorkStore,
    professionFilterStore,
    salaryRangeStore,
    incomeOfSourceStore,
    smsLanguageStore,
    civilStatusStore,
    mobileVerifiedStore,
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
    fillFilterProfession,
    setWindowWorkAddressOpen,
    setWindowConfirmNumberOpen,
    width,
    height,
    _labels,
    editMode,
    onInfo,
    onInfoClose,
    setReferenceRequired,
    maxAccess
}) => {


return (
        <Window id='CountryWindow' Title={_labels.pageTitle} onClose={onClose} width={width} height={height}
         onSave={onSave} onInfo={onInfo}  disabledInfo={!editMode && true} onInfoClose={onInfoClose} disabledSubmit={editMode && true}>
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
                    professionFilterStore={professionFilterStore}
                    fillFilterProfession={fillFilterProfession}
                    requiredOptional={requiredOptional}
                    salaryRangeStore={salaryRangeStore}
                    incomeOfSourceStore={incomeOfSourceStore}
                    smsLanguageStore={smsLanguageStore}
                    civilStatusStore={civilStatusStore}
                    genderStore={genderStore}
                    mobileVerifiedStore={mobileVerifiedStore}
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
                    setReferenceRequired={setReferenceRequired}
                    setWindowWorkAddressOpen={setWindowWorkAddressOpen}
                    setWindowConfirmNumberOpen={setWindowConfirmNumberOpen}
                    _labels={_labels}
                    maxAccess={maxAccess}
                    editMode={editMode}
                />
            </CustomTabPanel>
        </Window>
    )

}

export default ClientWindow
