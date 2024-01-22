// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from "@mui/material";

// ** Custom Imports
import CustomTextField from "src/components/Inputs/CustomTextField";
import CustomComboBox from "src/components/Inputs/CustomComboBox";

// ** Helpers

import AddressTab from "src/components/Shared/AddressTab";
import FieldSet from "src/components/Shared/FieldSet";
import CustomDatePicker from "src/components/Inputs/CustomDatePicker";
import { TextFieldReference } from "src/components/Shared/TextFieldReference";
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'

const ClientTab = ({props}) => {
// alert(props)

  const {
    clientCorporateFormValidation,
    activityStore,
    countryStore,
    legalStatusStore,
    cityAddressStore,
    cityDistrictAddressStore,
    setCityAddressStore,
    lookupCityAddress,
    lookupCityDistrictAddress,
    fillStateStoreAddress,
    stateAddressStore,
    industryStore,
    setReferenceRequired,
    _labels,
    maxAccess,
    editMode,
  } = props

  // alert(stateAddressStore)

return (
    <>
      <Grid container>
        <Grid container xs={12} spacing={2} sx={{ padding: "30px" }}>
          <Grid item xs={6} sx={{ padding: "40px" }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextFieldReference
                  name="reference"
                  label={_labels.reference}
                  value={clientCorporateFormValidation.values?.reference}
                  endpointId={CurrencyTradingSettingsRepository.Defaults.get}
                  param={'ct-nra-corporate'}
                  setReferenceRequired={setReferenceRequired}
                  onChange={clientCorporateFormValidation.handleChange}
                  maxLength="10"
                  editMode={editMode}
                  onClear={() =>
                    clientCorporateFormValidation.setFieldValue("reference", "")
                  }
                  error={
                    clientCorporateFormValidation.touched.reference &&
                    Boolean(clientCorporateFormValidation.errors.reference)
                  }
                  helperText={
                    clientCorporateFormValidation.touched.reference &&
                    clientCorporateFormValidation.errors.reference
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <CustomDatePicker
                  name="expiryDate"
                  label={_labels.expiryDate}
                  value={clientCorporateFormValidation.values?.expiryDate}
                  readOnly={editMode && true}
                  required={true}
                  onChange={clientCorporateFormValidation.setFieldValue}
                  onClear={() =>
                    clientCorporateFormValidation.setFieldValue(
                      "expiryDate",
                      ""
                    )
                  }
                  disabledDate={!editMode && "<"}
                  error={
                    clientCorporateFormValidation.touched.expiryDate &&
                    Boolean(clientCorporateFormValidation.errors.expiryDate)
                  }
                  helperText={
                    clientCorporateFormValidation.touched.expiryDate &&
                    clientCorporateFormValidation.errors.expiryDate
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Grid container xs={12}>
                  <FieldSet title={_labels.title}>
                    <Grid container xs={12} spacing={3}>
                      <Grid item xs={12}>
                        <CustomTextField
                          name="cellPhone"
                          phone={true}
                          label={_labels.cellPhone}
                          value={
                            clientCorporateFormValidation.values?.cellPhone
                          }
                          readOnly={editMode && true}
                          required
                          onChange={clientCorporateFormValidation.handleChange}
                          maxLength="15"
                          onClear={() =>
                            clientCorporateFormValidation.setFieldValue(
                              "cellPhone",
                              ""
                            )
                          }
                          error={
                            clientCorporateFormValidation.touched.cellPhone &&
                            Boolean(
                              clientCorporateFormValidation.errors.cellPhone
                            )
                          }
                          helperText={
                            clientCorporateFormValidation.touched.cellPhone &&
                            clientCorporateFormValidation.errors.cellPhone
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <CustomTextField
                          name="name1"
                          label={_labels.name}
                          value={clientCorporateFormValidation.values?.name1}
                          required
                          onChange={clientCorporateFormValidation.handleChange}
                          readOnly={editMode && true}
                          onClear={() =>
                            clientCorporateFormValidation.setFieldValue(
                              "name1",
                              ""
                            )
                          }
                          error={
                            clientCorporateFormValidation.touched.name1 &&
                            Boolean(clientCorporateFormValidation.errors.name1)
                          }
                          helperText={
                            clientCorporateFormValidation.touched.name1 &&
                            clientCorporateFormValidation.errors.name1
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <CustomTextField
                          name="flName"
                          label={_labels.flName}
                          value={clientCorporateFormValidation.values?.flName}
                          onChange={clientCorporateFormValidation.flName}
                          maxLength="10"
                          readOnly={editMode && true}
                          onClear={() =>
                            clientCorporateFormValidation.setFieldValue(
                              "flName",
                              ""
                            )
                          }
                          error={
                            clientCorporateFormValidation.touched.flName &&
                            Boolean(clientCorporateFormValidation.errors.flName)
                          }
                          helperText={
                            clientCorporateFormValidation.touched.flName &&
                            clientCorporateFormValidation.errors.flName
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <CustomComboBox
                          name="nationalityId"
                          label={_labels.nationality}
                          valueField="recordId"

                          // displayField="name"
                          store={countryStore}
                          displayField={["reference", "name", "flName"]}
                          columnsInDropDown={[
                            { key: "reference", value: "Reference" },
                            { key: "name", value: "Name" },
                            { key: "flName", value: "Foreign Language Name" },
                          ]}
                          readOnly={editMode && true}
                          value={
                            countryStore.filter(
                              (item) =>
                                item.recordId ===
                                clientCorporateFormValidation.values
                                  .nationalityId
                            )[0]
                          }
                          required
                          onChange={(event, newValue) => {
                            if (newValue) {
                              clientCorporateFormValidation.setFieldValue(
                                "nationalityId",
                                newValue?.recordId
                              );
                              clientCorporateFormValidation.setFieldValue(
                                "nationalityName",
                                newValue?.name
                              );
                            } else {
                              clientCorporateFormValidation.setFieldValue(
                                "nationalityId",
                                ""
                              );
                              clientCorporateFormValidation.setFieldValue(
                                "nationalityName",
                                ""
                              );
                            }
                          }}
                          error={
                            clientCorporateFormValidation.touched
                              .nationalityId &&
                            Boolean(
                              clientCorporateFormValidation.errors.nationalityId
                            )
                          }
                          helperText={
                            clientCorporateFormValidation.touched
                              .nationalityId &&
                            clientCorporateFormValidation.errors.nationalityId
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <CustomTextField
                          name="oldReference"
                          label={_labels.oldReference}
                          value={
                            clientCorporateFormValidation.values?.oldReference
                          }
                          readOnly={editMode && true}
                          onChange={clientCorporateFormValidation.handleChange}
                          maxLength="10"
                          onClear={() =>
                            clientCorporateFormValidation.setFieldValue(
                              "oldReference",
                              ""
                            )
                          }
                          error={
                            clientCorporateFormValidation.touched
                              .oldReference &&
                            Boolean(
                              clientCorporateFormValidation.errors.oldReference
                            )
                          }
                          helperText={
                            clientCorporateFormValidation.touched
                              .oldReference &&
                            clientCorporateFormValidation.errors.oldReference
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <CustomComboBox
                          name="lgsId"
                          label={_labels.legalStatus}
                          valueField="recordId"

                          // displayField="name"
                          store={legalStatusStore}
                          displayField={["reference", "name"]}
                          columnsInDropDown={[
                            { key: "reference", value: "Reference" },
                            { key: "name", value: "Name" },
                          ]}
                          readOnly={editMode && true}
                          value={
                            legalStatusStore.filter(
                              (item) =>
                                item.recordId ===
                                clientCorporateFormValidation.values.lgsId
                            )[0]
                          }
                          required
                          onChange={(event, newValue) => {
                            if (newValue) {
                              clientCorporateFormValidation.setFieldValue(
                                "lgsId",
                                newValue?.recordId
                              );
                            } else {
                              clientCorporateFormValidation.setFieldValue(
                                "lgsId",
                                ""
                              );
                            }
                          }}
                          error={
                            clientCorporateFormValidation.touched.lgsId &&
                            Boolean(clientCorporateFormValidation.errors.lgsId)
                          }
                          helperText={
                            clientCorporateFormValidation.touched.lgsId &&
                            clientCorporateFormValidation.errors.lgsId
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomComboBox
                          name="industry"
                          label={_labels.industry}
                          valueField="key"

                          // displayField="name"
                          store={industryStore}
                          displayField='value'

                          readOnly={editMode && true}
                          value={
                            industryStore.filter(
                              (item) =>
                                item.key ===
                                clientCorporateFormValidation.values
                                  .industry
                            )[0]
                          }
                          required
                          onChange={(event, newValue) => {
                            if (newValue) {
                              clientCorporateFormValidation.setFieldValue(
                                "industry",
                                newValue?.key
                              );

                            } else {
                              clientCorporateFormValidation.setFieldValue(
                                "industry",
                                ""
                              );

                            }
                          }}
                          error={
                            clientCorporateFormValidation.touched
                              .nationalityId &&
                            Boolean(
                              clientCorporateFormValidation.errors.nationalityId
                            )
                          }
                          helperText={
                            clientCorporateFormValidation.touched
                              .nationalityId &&
                            clientCorporateFormValidation.errors.nationalityId
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <CustomComboBox
                          name="activityId"
                          label={_labels.activity}
                          valueField="recordId"

                          // displayField="name"
                          store={activityStore}
                          displayField={["reference", "name"]}
                          columnsInDropDown={[
                            { key: "reference", value: "Reference" },
                            { key: "name", value: "Name" },
                          ]}
                          readOnly={editMode && true}
                          value={
                            activityStore.filter(
                              (item) =>
                                item.recordId ===
                                clientCorporateFormValidation.values.activityId
                            )[0]
                          }
                          required
                          onChange={(event, newValue) => {
                            if (newValue) {
                              clientCorporateFormValidation.setFieldValue(
                                "activityId",
                                newValue?.recordId
                              );
                            } else {
                              clientCorporateFormValidation.setFieldValue(
                                "activityId",
                                ""
                              );
                            }
                          }}
                          error={
                            clientCorporateFormValidation.touched.activityId &&
                            Boolean(
                              clientCorporateFormValidation.errors.activityId
                            )
                          }
                          helperText={
                            clientCorporateFormValidation.touched.activityId &&
                            clientCorporateFormValidation.errors.activityId
                          }
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sx={{ position: "relative", width: "100%" }}
                      >
                        <CustomTextField
                          name="capital"
                          label={_labels.capital}
                          value={clientCorporateFormValidation.values?.capital}
                          readOnly={editMode && true}
                          required
                          onChange={clientCorporateFormValidation.handleChange}
                          onClear={() =>
                            clientCorporateFormValidation.setFieldValue(
                              "capital",
                              ""
                            )
                          }
                          error={
                            clientCorporateFormValidation.touched.capital &&
                            Boolean(
                              clientCorporateFormValidation.errors.capital
                            )
                          }
                          helperText={
                            clientCorporateFormValidation.touched.capital &&
                            clientCorporateFormValidation.errors.capital
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="trading"
                              checked={
                                clientCorporateFormValidation.values?.trading
                              }
                              onChange={
                                clientCorporateFormValidation.handleChange
                              }
                            />
                          }
                          label={_labels?.trading}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="inward"
                              checked={
                                clientCorporateFormValidation.values?.inward
                              }
                              onChange={
                                clientCorporateFormValidation.handleChange
                              }
                            />
                          }
                          label={_labels?.inward}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="outward"
                              checked={
                                clientCorporateFormValidation.values?.outward
                              }
                              onChange={clientCorporateFormValidation.handleChange}
                            />
                          }
                          label={_labels?.outward}
                        />
                      </Grid>
                    </Grid>
                  </FieldSet>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <FieldSet title={_labels.address}>
              <AddressTab
                labels={_labels}
                addressValidation={clientCorporateFormValidation}
                countryStore={countryStore}
                cityStore={cityAddressStore}
                setCityStore={setCityAddressStore}
                lookupCity={lookupCityAddress}
                stateStore={stateAddressStore}
                fillStateStore={fillStateStoreAddress}
                lookupCityDistrict={lookupCityDistrictAddress}
                cityDistrictStore={cityDistrictAddressStore}
                readOnly={editMode && true}
              />
            </FieldSet>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="OTPVerified"
                    disabled={true}
                    readOnly={editMode && true}
                    checked={clientCorporateFormValidation.values?.OTPVerified}
                    onChange={clientCorporateFormValidation.handleChange}
                  />
                }
                label={_labels?.OTPVerified}
              />
            </Grid>
          </Grid>

          <Grid
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              padding: 3,
              textAlign: "center",
            }}
          ></Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default ClientTab;
