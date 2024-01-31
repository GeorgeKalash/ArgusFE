// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// **Tabs
import ClientTab from '../forms/ClientTemplateForm'
import ClientTemplateForm from '../forms/ClientTemplateForm'

const ClientWindow = (props) => {

console.log(props)

const {
  onClose,
  onSave,

  // clientCorporateFormValidation,
  // types,

  // countryStore,
  // cityStore,
  // setCityStore,
  // cityAddressStore,
  // setCityAddressStore,
  // activityStore,
  // mobileVerifiedStore,
  // fillStateStoreAddress,
  // stateAddressStore,
  // cityDistrictAddressStore,
  //  lookupCity,
  // lookupCityAddress,
  // legalStatusStore,
  // industryStore,

  width,
  height,
  _labels,
  editMode,
  onInfo,
  onInfoClose,

  // maxAccess
} = props


return (

        <Window id='clientCorporateWindow' Title={_labels.title} onClose={onClose} width={width} height={height}
         onSave={onSave} onInfo={editMode && onInfo} onInfoClose={onInfoClose} disabledSubmit={editMode && true}>
            <CustomTabPanel>
                <ClientTemplateForm
                 props={props}

                    // clientCorporateFormValidation={clientCorporateFormValidation}
                    // types={types}
                    // countryStore={countryStore}
                    // cityStore={cityStore}
                    // setCityStore={setCityStore}
                    // cityAddressStore={cityAddressStore}
                    // industryStore={industryStore}
                    // mobileVerifiedStore={mobileVerifiedStore}
                    // fillStateStoreAddress={fillStateStoreAddress}
                    // stateAddressStore={stateAddressStore}
                    // setCityAddressStore={setCityAddressStore}
                    // lookupCity={lookupCity}
                    // legalStatusStore={ legalStatusStore}
                    // lookupCityAddress={lookupCityAddress}
                    // activityStore={activityStore}
                    // cityDistrictAddressStore={cityDistrictAddressStore}
                    // _labels={_labels}
                    // maxAccess={maxAccess}
                    // editMode={editMode}
                />
            </CustomTabPanel>
        </Window>
    )
}


export default ClientWindow
