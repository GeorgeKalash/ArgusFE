// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

// ** Helpers

import AddressTab from 'src/components/Shared/AddressTab'
import FieldSet from 'src/components/Shared/FieldSet'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomLookup from 'src/components/Inputs/CustomLookup'

const ClientTab = ({
  clientIndividualFormValidation,
  WorkAddressValidation,
  countryStore,
  cityStore,
  setCityStore,
  cityAddressStore,
  setCityAddressStore,
  cityAddressWorkStore,
  setCityAddressWorkStore,

  lookupCity,
  lookupCityAddress,
  lookupCityAddressWork,
  types,
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
   _labels, maxAccess, editMode
 }) => {
  console.log(cityAddressStore)

  const encryptFirstFourDigits = (e) => {
    const input = e.target.value
    const showLength = Math.max(0, input.length - 4);

    // Check if input has at least four digits

  const maskedValue =
    '*'.repeat(showLength) + input.substring(showLength);
     clientIndividualFormValidation.setFieldValue("numberEncrypt", maskedValue)

    //  clientIndividualFormValidation.setFieldValue("numberEncrypt", input)


  };

  const encryptFirstFourDigitsRepeat = (e) => {
    const input = e.target.value
    const showLength = Math.max(0, input.length - 4);

    // Check if input has at least four digits

  const maskedValue =
    '*'.repeat(showLength) + input.substring(showLength);
     clientIndividualFormValidation.setFieldValue("numberRepeatEncrypt", maskedValue)

    //  clientIndividualFormValidation.setFieldValue("numberRepeat", input)


  };

  const handleCopy = (event) => {
    event.preventDefault();
  };

return (
        <>
            <Grid container spacing={4}>
            <Grid container xs={12} spacing={2} sx={{ padding: "40px" }}>
        <Grid item xs={6} sx={{ padding: "40px" }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <CustomTextField
                name="reference"
                label={_labels.reference}
                value={clientIndividualFormValidation.values?.reference}

                // required
                disabled={true}
                onChange={clientIndividualFormValidation.handleChange}
                maxLength="10"
                onClear={() =>
                  clientIndividualFormValidation.setFieldValue("reference", "")
                }
                error={
                  clientIndividualFormValidation.touched.reference &&
                  Boolean(clientIndividualFormValidation.errors.reference)
                }
                helperText={
                  clientIndividualFormValidation.touched.reference &&
                  clientIndividualFormValidation.errors.reference
                }
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isResident"
                    checked={clientIndividualFormValidation.values?.isResident}
                    onChange={clientIndividualFormValidation.handleChange}
                  />
                }
                label={_labels.isResident}
              />
            </Grid>
{/*
            <Grid item xs={12}>
              <CustomDatePicker
                name="birthDate"
                label={_labels.birthDate}
                value={clientIndividualFormValidation.values?.birthDate}
                required={true}
                onChange={clientIndividualFormValidation.handleChange}
                onClear={() =>
                  clientIndividualFormValidation.setFieldValue("birthDate", "")
                }
                error={
                  clientIndividualFormValidation.touched.birthDate &&
                  Boolean(clientIndividualFormValidation.errors.birthDate)
                }
                helperText={
                  clientIndividualFormValidation.touched.birthDate &&
                  clientIndividualFormValidation.errors.birthDate
                }
              />
            </Grid> */}

            <Grid container xs={12}></Grid>
            <Grid item xs={12}>
              <FieldSet title={_labels.id}>
              <Grid item xs={12}>
                  <CustomComboBox
                    name="idtId"
                    label={_labels.type}
                    valueField="recordId"
                    displayField="name"

                    store={idTypeStore}
                    value={
                      idTypeStore.filter(
                        (item) =>
                          item.recordId ===
                          clientIndividualFormValidation.values.idtId,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {
                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "idtId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "typeName",
                        newValue?.name,
                      );}else{

                        clientIndividualFormValidation.setFieldValue(
                          "idtId",
                          '',
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "typeName",
                          '',
                        );

                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.idtId &&
                      Boolean(clientIndividualFormValidation.errors.idtId)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.idtId &&
                      clientIndividualFormValidation.errors.idtId
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name="number"
                    label={_labels.number}
                    value={clientIndividualFormValidation.values?.numberEncrypt}
                    required
                    onChange={ (e) =>{ clientIndividualFormValidation.handleChange(e) , encryptFirstFourDigits(e)  }}
                    onCopy={handleCopy}
                    onPaste={handleCopy}

                    // maxLength="10"
                    onClear={() =>{
                      clientIndividualFormValidation.setFieldValue("number", "")
                      clientIndividualFormValidation.setFieldValue("numberEncrypt", "")}

                    }
                    error={
                      clientIndividualFormValidation.touched.number &&
                      Boolean(clientIndividualFormValidation.errors.number)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.number &&
                      clientIndividualFormValidation.errors.number
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name="numberRepeat"
                    label={_labels.number}
                    value={clientIndividualFormValidation.values?.numberRepeatEncrypt}
                    required
                    onChange={ (e) =>{ clientIndividualFormValidation.handleChange(e) , encryptFirstFourDigitsRepeat(e)  }}
                    onBlur={clientIndividualFormValidation.handleBlur}
                    onCopy={handleCopy}
                    onPaste={handleCopy}

                    // maxLength="10"
                    onClear={() =>{
                      clientIndividualFormValidation.setFieldValue("numberRepeat", "")
                      clientIndividualFormValidation.setFieldValue("numberRepeatEncrypt", "")}

                    }
                    error={
                      clientIndividualFormValidation.touched.numberRepeat &&
                      Boolean(clientIndividualFormValidation.errors.numberRepeat)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.numberRepeat &&
                      clientIndividualFormValidation.errors.numberRepeat
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name="expiryDate"
                    label={_labels.expiryDate}
                    value={clientIndividualFormValidation.values?.expiryDate}
                    required={true}
                    onChange={clientIndividualFormValidation.setFieldValue}
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "expiryDate",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.expiryDate &&
                      Boolean(clientIndividualFormValidation.errors.expiryDate)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.expiryDate &&
                      clientIndividualFormValidation.errors.expiryDate
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomDatePicker
                    name="issusDate"
                    label={_labels.issusDate}
                    value={clientIndividualFormValidation.values?.issusDate}

                    // required={true}
                    onChange={clientIndividualFormValidation.handleChange}
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "issusDate",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.issusDate &&
                      Boolean(clientIndividualFormValidation.errors.issusDate)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.issusDate &&
                      clientIndividualFormValidation.errors.issusDate
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomComboBox
                    name="idCountry"
                    label={_labels.country}
                    valueField="recordId"
                    displayField={['reference','name','flName']}
                store={countryStore}
                columnsInDropDown= {[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language Name' }
                ]}
                    value={
                      countryStore.filter(
                        (item) =>
                          item.recordId ===
                          clientIndividualFormValidation.values.idCountry,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {
                      // setCityStore([])

                      if(newValue){


                      clientIndividualFormValidation.setFieldValue(
                        "idCountry",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "country",
                        newValue?.name,
                      );}else{
                        clientIndividualFormValidation.setFieldValue(
                          "idCountry",
                          ''
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "country",
                          ''
                        );

                        clientIndividualFormValidation.setFieldValue(
                          "idCity",
                          null
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "city",
                          null
                        );


                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.idCountry &&
                      Boolean(clientIndividualFormValidation.errors.idCountry)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.idCountry &&
                      clientIndividualFormValidation.errors.idCountry
                    }
                  />
                </Grid>

                <Grid item xs={12}>


                  <CustomLookup
                    name="idCity"
                    label={_labels.city}
                    value={clientIndividualFormValidation.values.idCity}
                    required
                    valueField="name"
                    store={cityStore}
                    firstValue={clientIndividualFormValidation.values.city}

                    // secondValue={clientIndividualFormValidation.values.cityName}

                    secondDisplayField={false}

                    //  secondDisplayField={false}
                    setStore={setCityStore}
                    onLookup={lookupCity}


                    onChange={(event, newValue) => {
                      if (newValue) {
                        clientIndividualFormValidation.setFieldValue(
                          "idCity",
                          newValue?.recordId,
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "city",
                          newValue?.name,
                        );
                      } else {
                        clientIndividualFormValidation.setFieldValue(
                          "idCity",
                          null,
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "city",
                          null,
                        );
                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.idCity &&
                      Boolean(clientIndividualFormValidation.errors.idCity)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.idCity &&
                      clientIndividualFormValidation.errors.idCity
                    }
                  />
                </Grid>
              </FieldSet>
              <Grid item xs={12} sx={{marginTop:'20px'}}>
                <FieldSet title={_labels.address}>
               <AddressTab labels={_labels} addressValidation={clientIndividualFormValidation} countryStore={countryStore} cityStore={cityAddressStore} setCityStore={setCityAddressStore}  lookupCity={lookupCityAddress} stateStore={stateAddressStore}  fillStateStore={fillStateStoreAddress}/>
               </FieldSet>
                {/* <Grid item xs={12}>
                  <CustomTextField
                    name="whatsappNo"
                    label={_labels.whatsapp}
                    value={clientIndividualFormValidation.values?.whatsappNo}
                    required
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "whatsappNo",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.whatsappNo &&
                      Boolean(clientIndividualFormValidation.errors.whatsappNo)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.whatsappNo &&
                      clientIndividualFormValidation.errors.whatsappNo
                    }
                  />
                </Grid> */}

<Grid container spacing={2} sx={{ marginTop: "20px" }}>
              <Grid container xs={12} spacing={2} >
                <Grid item xs={12}>
                  <CustomComboBox
                    name="salaryRangeId"
                    label={_labels.salaryRange}
                    valueField="recordId"
                    displayField={["min", "max"]}
                    columnsInDropDown={[
                      { key: "min", value: "min" },
                      { key: "max", value: "max" },
                    ]}
                    store={salaryRangeStore}
                    value={
                      salaryRangeStore.filter(
                        (item) =>
                          item.recordId ===
                          clientIndividualFormValidation.values.salaryRangeId,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "salaryRangeId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "salaryRange",
                        newValue?.name,
                      );
                    }else{
                      clientIndividualFormValidation.setFieldValue(
                        "salaryRangeId",
                        '',
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "salaryRange",
                        '',
                      );

                    }
                    }}
                    error={
                      clientIndividualFormValidation.touched.salaryRangeId &&
                      Boolean(
                        clientIndividualFormValidation.errors.salaryRangeId,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.salaryRangeId &&
                      clientIndividualFormValidation.errors.salaryRangeId
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomComboBox
                    name="riskLevel"
                    label={_labels.riskLevel}
                    readOnly //disabled
                    valueField="recordId"
                    displayField="name"
                    store={countryStore}
                    value={
                      countryStore.filter(
                        (item) =>
                          item.recordId ===
                          clientIndividualFormValidation.values.riskLevelId,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "riskLevelId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "riskLevel",
                        newValue?.name,
                      );}else{

                        clientIndividualFormValidation.setFieldValue(
                          "riskLevelId",
                          null,
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "riskLevel",
                          null,
                        );

                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.riskLevelId &&
                      Boolean(clientIndividualFormValidation.errors.riskLevelId)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.riskLevelId &&
                      clientIndividualFormValidation.errors.riskLevelId
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomComboBox
                    name="smsLanguage"
                    label={_labels.smsLanguage}
                    valueField="key"
                    displayField="value"
                    store={smsLanguageStore}
                    value={
                      smsLanguageStore.filter(
                        (item) =>
                          item.key ===
                          clientIndividualFormValidation.values.smsLanguage,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "smsLanguage",
                        newValue?.key,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "smsLanguageName",
                        newValue?.value,
                      );
                    }else{

                        clientIndividualFormValidation.setFieldValue(
                          "smsLanguage",
                          '',
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "smsLanguageName",
                          '',
                        );
                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.smsLanguage &&
                      Boolean(
                        clientIndividualFormValidation.errors.smsLanguage,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.smsLanguage &&
                      clientIndividualFormValidation.errors.smsLanguage
                    }
                  />
                </Grid>


              </Grid>
              <Grid container xs={12} spacing={2}  sx={{marginTop:'5px'}}>
                <Grid item xs={12}>
                  <CustomComboBox
                    name="civilStatus"
                    label={_labels.civilStatus}
                    valueField="key"
                    displayField="value"
                    store={civilStatusStore}
                    value={clientIndividualFormValidation.values?.civilStatusName}
                    onChange={(event, newValue) => {

                      if(newValue){
                        clientIndividualFormValidation.setFieldValue(
                          "civilStatus",
                          newValue?.key,
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "civilStatusName",
                          newValue?.value,
                        );
                      }else{
                      clientIndividualFormValidation.setFieldValue(
                        "civilStatus",
                        newValue?.key,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "civilStatusName",
                        newValue?.value,
                      );

                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.civilStatus &&
                      Boolean(
                        clientIndividualFormValidation.errors.civilStatus,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.civilStatus &&
                      clientIndividualFormValidation.errors.civilStatus
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                <CustomTextField
                  name="statusName"
                  label={_labels.status}
                  value={clientIndividualFormValidation.values?.statusName}
                  required
                  type="number"
                  onChange={clientIndividualFormValidation.handleChange}
                  maxLength="10"
                  onClear={() =>
                    clientIndividualFormValidation.setFieldValue("statusName", "")
                  }
                  readonly

                  error={
                    clientIndividualFormValidation.touched.statusName &&
                    Boolean(clientIndividualFormValidation.errors.statusName)
                  }
                  helperText={
                    clientIndividualFormValidation.touched.statusName &&
                    clientIndividualFormValidation.errors.statusName
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  name="oldReference"
                  label={_labels.oldReference}
                  value={clientIndividualFormValidation.values?.oldReference}

                  onChange={clientIndividualFormValidation.handleChange}
                  maxLength="10"
                  onClear={() =>
                    clientIndividualFormValidation.setFieldValue(
                      "oldReference",
                      "",
                    )
                  }
                  error={
                    clientIndividualFormValidation.touched.oldReference &&
                    Boolean(clientIndividualFormValidation.errors.oldReference)
                  }
                  helperText={
                    clientIndividualFormValidation.touched.oldReference &&
                    clientIndividualFormValidation.errors.oldReference
                  }
                />
              </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    name="whatsappNo"
                    label={_labels.whatsapp}
                    value={clientIndividualFormValidation.values?.whatsappNo}

                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="15"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "whatsappNo",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.whatsappNo &&
                      Boolean(clientIndividualFormValidation.errors.whatsappNo)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.whatsappNo &&
                      clientIndividualFormValidation.errors.whatsappNo
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomComboBox
                    name="title"
                    label={_labels.title}
                    valueField="key"
                    displayField="value"
                    store={titleStore}
                    value={clientIndividualFormValidation.values?.title}
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "titleId",
                        newValue?.key,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "titleId",
                        newValue?.value,
                      );
                      }else{
                        clientIndividualFormValidation.setFieldValue(
                          "titleId",
                          null,
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "title",
                          null,
                        );
                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.title &&
                      Boolean(clientIndividualFormValidation.errors.title )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.title &&
                      clientIndividualFormValidation.errors.title
                    }
                  />
                </Grid>
              </Grid>

            </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={6}>
          <Grid container xs={12} spacing={2}>

            <Grid container xs={12} >
              <FieldSet title={_labels.customerInformation}>
              <Grid item xs={6}>
                <CustomTextField
                  name="cellPhone"
                  label={_labels.cellPhone}
                  value={clientIndividualFormValidation.values?.cellPhone}
                  required
                  onChange={clientIndividualFormValidation.handleChange}
                  maxLength="15"
                  onCopy={handleCopy}
                  onPaste={handleCopy}
                  onClear={() =>
                    clientIndividualFormValidation.setFieldValue(
                      "cellPhone",
                      "",
                    )
                  }
                  error={
                    clientIndividualFormValidation.touched.cellPhone &&
                    Boolean(clientIndividualFormValidation.errors.cellPhone)
                  }
                  helperText={
                    clientIndividualFormValidation.touched.cellPhone &&
                    clientIndividualFormValidation.errors.cellPhone
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <CustomTextField
                  name="cellPhoneRepeat"
                  label={_labels.cellPhone}
                  value={clientIndividualFormValidation.values?.cellPhoneRepeat}
                  required
                  maxLength="15"
                  onChange={clientIndividualFormValidation.handleChange}
                  onCopy={handleCopy}
                  onPaste={handleCopy}
                  onClear={() =>
                    clientIndividualFormValidation.setFieldValue(
                      "cellPhoneRepeat",
                      "",
                    )
                  }
                  error={
                    clientIndividualFormValidation.touched.cellPhoneRepeat &&
                    Boolean(clientIndividualFormValidation.errors.cellPhoneRepeat)
                  }
                  onBlur={clientIndividualFormValidation.handleBlur}

                  helperText={
                    clientIndividualFormValidation.touched.cellPhoneRepeat &&
                    clientIndividualFormValidation.errors.cellPhoneRepeat
                  }
                />
              </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="firstName"
                    label={_labels.first}
                    value={clientIndividualFormValidation.values?.firstName}
                    required
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "firstName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.firstName &&
                      Boolean(clientIndividualFormValidation.errors.firstName)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.firstName &&
                      clientIndividualFormValidation.errors.firstName
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="middleName"
                    label={_labels.middle}
                    value={clientIndividualFormValidation.values?.middleName}
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "middleName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.middleName &&
                      Boolean(clientIndividualFormValidation.errors.middleName)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.middleName &&
                      clientIndividualFormValidation.errors.middleName
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="lastName"
                    label={_labels.last}
                    value={clientIndividualFormValidation.values?.lastName}
                    required
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "lastName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.lastName &&
                      Boolean(clientIndividualFormValidation.errors.lastName)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.lastName &&
                      clientIndividualFormValidation.errors.lastName
                    }
                  />
                </Grid>


                <Grid item xs={3}>
                  <CustomTextField
                    name="familyName"
                    label={_labels.family}
                    value={clientIndividualFormValidation.values?.familyName}
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "familyName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.familyName &&
                      Boolean(clientIndividualFormValidation.errors.familyName)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.familyName &&
                      clientIndividualFormValidation.errors.familyName
                    }
                  />
                </Grid>






                <Grid item xs={3}>
                  <CustomTextField
                    name="fl_familyName"
                    label={_labels.fl_family}
                    value={clientIndividualFormValidation.values?.fl_familyName}
                    onChange={clientIndividualFormValidation.handleChange}
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "fl_familyName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.fl_familyName &&
                      Boolean(
                        clientIndividualFormValidation.errors.fl_familyName,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.fl_familyName &&
                      clientIndividualFormValidation.errors.fl_familyName
                    }
                  />
                </Grid>


                <Grid item xs={3}>
                <CustomTextField
                    name="fl_lastName"
                    label={_labels.fl_last}
                    value={clientIndividualFormValidation.values?.fl_lastName}
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "fl_lastName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.fl_lastName &&
                      Boolean(clientIndividualFormValidation.errors.fl_lastName)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.fl_lastName &&
                      clientIndividualFormValidation.errors.fl_lastName
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="fl_middleName"
                    label={_labels.fl_middle}
                    value={clientIndividualFormValidation.values?.fl_middleName}
                    onChange={clientIndividualFormValidation.handleChange}
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "fl_familyName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.fl_middleName &&
                      Boolean(
                        clientIndividualFormValidation.errors.fl_middleName,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.fl_middleName &&
                      clientIndividualFormValidation.errors.fl_middleName
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name="fl_firstName"
                    label={_labels.fl_first}
                    value={clientIndividualFormValidation.values?.fl_firstName}
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "fl_firstName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.fl_firstName &&
                      Boolean(
                        clientIndividualFormValidation.errors.fl_firstName,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.fl_firstName &&
                      clientIndividualFormValidation.errors.fl_firstName
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                <CustomComboBox
                  name="nationalityId"
                  label={_labels.nationality}
                  valueField="recordId"
                  displayField="name"
                  store={countryStore}
                  value={
                    countryStore.filter(
                      (item) =>
                        item.recordId ===
                        clientIndividualFormValidation.values.nationalityId,
                    )[0]
                  }
                  required
                  onChange={(event, newValue) => {

                    if(newValue){
                    clientIndividualFormValidation.setFieldValue(
                      "nationalityId",
                      newValue?.recordId,
                    );
                    clientIndividualFormValidation.setFieldValue(
                      "nationalityName",
                      newValue?.name,
                    );}else{

                      clientIndividualFormValidation.setFieldValue(
                        "nationalityId",
                        ''
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "nationalityName",
                        '',
                      );


                    }
                  }}
                  error={
                    clientIndividualFormValidation.touched.nationalityId &&
                    Boolean(clientIndividualFormValidation.errors.nationalityId)
                  }
                  helperText={
                    clientIndividualFormValidation.touched.nationalityId &&
                    clientIndividualFormValidation.errors.nationalityId
                  }
                />
              </Grid>

            <Grid item xs={12}>
              <CustomDatePicker
                name="birthDate"
                label={_labels.birthDate}
                value={clientIndividualFormValidation.values?.birthDate}
                required={true}
                onChange={clientIndividualFormValidation.setFieldValue}
                onClear={() =>
                  clientIndividualFormValidation.setFieldValue("birthDate", "")
                }
                error={
                  clientIndividualFormValidation.touched.birthDate &&
                  Boolean(clientIndividualFormValidation.errors.birthDate)
                }
                helperText={
                  clientIndividualFormValidation.touched.birthDate &&
                  clientIndividualFormValidation.errors.birthDate
                }
              />
            </Grid>
            <Grid item xs={12}>
                  <CustomComboBox
                    name="gender"
                    label={_labels.gender}
                    valueField="key"
                    displayField="value"
                    store={genderStore}
                    required
                    value={
                      genderStore.filter(
                        (item) =>
                          item.key ===
                          clientIndividualFormValidation.values.gender,
                      )[0]
                    }                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "gender",
                        newValue?.key,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "genderName",
                        newValue?.value,
                      );
                    }else{

                      clientIndividualFormValidation.setFieldValue(
                        "genderId",
                        '',
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "gender",
                        '',
                      );
                    }
                    }}
                    error={
                      clientIndividualFormValidation.touched.gender &&
                      Boolean(clientIndividualFormValidation.errors.gender)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.gender &&
                      clientIndividualFormValidation.errors.gender
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomComboBox
                    name="educationLevel"
                    label={_labels.educationLevel}
                    valueField="key"
                    displayField="value"
                    store={educationStore}

                    // value={
                    //   clientIndividualFormValidation.values?.educationLevel
                    // }

                    value={
                      educationStore.filter(
                        (item) =>
                          item.key ===
                          clientIndividualFormValidation.values.educationLevel,
                      )[0]
                    }
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "educationLevel",
                        newValue?.key,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "educationLevelName",
                        newValue?.Value,
                      );
                    }else{
                      clientIndividualFormValidation.setFieldValue(
                        "educationLevel",
                        null,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "educationLevelName",
                        null,
                      );

                      }
                    }}
                    error={
                      clientIndividualFormValidation.touched.educationLevel &&
                      Boolean(
                        clientIndividualFormValidation.errors.educationLevel,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.educationLevel &&
                      clientIndividualFormValidation.errors.educationLevel
                    }
                  />
                </Grid>
                {/* <Grid item xs={7}>
                  <CustomComboBox
                    name="category"
                    label={_labels.educationLevel}
                    valueField="recordId"
                    displayField="name"
                    store={countryStore}
                    value={
                      clientIndividualFormValidation.values?.educationLevelId
                    }
                    onChange={(event, newValue) => {
                      clientIndividualFormValidation.setFieldValue(
                        "educationLevelId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "educationLevel",
                        newValue?.name,
                      );
                    }}
                    error={
                      clientIndividualFormValidation.touched.educationLevelId &&
                      Boolean(
                        clientIndividualFormValidation.errors.educationLevelId,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.educationLevelId &&
                      clientIndividualFormValidation.errors.educationLevelId
                    }
                  />
                </Grid> */}
                <Grid item xs={12}>
                  <CustomComboBox
                    name="incomeSourceId"
                    label={_labels.incomeSource}
                    valueField="recordId"
                    displayField="name"
                    store={incomeOfSourceStore}
                    value={
                      incomeOfSourceStore.filter(
                        (item) =>
                          item.recordId ===
                          clientIndividualFormValidation.values.incomeSourceId,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {
                      clientIndividualFormValidation.setFieldValue(
                        "incomeSourceId",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "incomeSource",
                        newValue?.name,
                      );
                    }}
                    error={
                      clientIndividualFormValidation.touched.incomeSourceId &&
                      Boolean(
                        clientIndividualFormValidation.errors.incomeSourceId,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.incomeSourceId &&
                      clientIndividualFormValidation.errors.incomeSourceId
                    }
                  />
                </Grid>


                <Grid item xs={12}>
                  <CustomTextField
                    name="salary"
                    label='salary'    //{_labels.whatsapp}
                    value={clientIndividualFormValidation.values?.whatsappNo}
                    required
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "whatsappNo",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.whatsappNo &&
                      Boolean(clientIndividualFormValidation.errors.whatsappNo)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.whatsappNo &&
                      clientIndividualFormValidation.errors.whatsappNo
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    name="sponsorName"
                    label={_labels.sponsor}
                    value={clientIndividualFormValidation.values?.sponsorName}
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="15"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "sponsorName",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.sponsorName &&
                      Boolean(clientIndividualFormValidation.errors.sponsorName)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.sponsorName &&
                      clientIndividualFormValidation.errors.sponsorName
                    }
                  />
                </Grid>
                {/* <Grid item xs={12}>
                <CustomTextField
                  name="cellPhone"
                  label={_labels.cellPhone}
                  value={clientIndividualFormValidation.values?.cellPhone}
                  required
                  onChange={clientIndividualFormValidation.handleChange}
                  maxLength="10"
                  onClear={() =>
                    clientIndividualFormValidation.setFieldValue(
                      "cellPhone",
                      "",
                    )
                  }
                  error={
                    clientIndividualFormValidation.touched.cellPhone &&
                    Boolean(clientIndividualFormValidation.errors.cellPhone)
                  }
                  helperText={
                    clientIndividualFormValidation.touched.cellPhone &&
                    clientIndividualFormValidation.errors.cellPhone
                  }
                />
              </Grid> */}
              <Grid item xs={12} >
                <CustomComboBox
                  name="professionId"
                  label={_labels.profession}
                  valueField="recordId"
                  displayField="name"
                  store={professionStore}
                  value={
                    professionStore.filter(
                      (item) =>
                        item.recordId ===
                        clientIndividualFormValidation.values.professionId,
                    )[0]
                  }
                  required
                  onChange={(event, newValue) => {
                    clientIndividualFormValidation.setFieldValue(
                      "professionId",
                      newValue?.recordId,
                    );
                    clientIndividualFormValidation.setFieldValue(
                      "professionName",
                      newValue?.name,
                    );
                  }}
                  error={
                    clientIndividualFormValidation.touched.professionId &&
                    Boolean(clientIndividualFormValidation.errors.professionId)
                  }
                  helperText={
                    clientIndividualFormValidation.touched.professionId &&
                    clientIndividualFormValidation.errors.professionId
                  }
                />
              </Grid>
              </FieldSet>


               <Grid container sx={{marginTop: '20px'}}>
              <FieldSet title={_labels.workAddress}>
              <AddressTab labels={_labels} addressValidation={WorkAddressValidation} countryStore={countryStore} cityStore={cityAddressWorkStore} setCityStore={setCityAddressWorkStore} lookupCity={lookupCityAddressWork} stateStore={stateAddressWorkStore}   fillStateStore={fillStateStoreAddressWork}/>

               </FieldSet>
               </Grid>

               <Grid container xs={6} spacing={2} sx={{ padding: "5px" }}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="mobileVerified"
                        disabled={true}

                        // checked={clientIndividualFormValidation.values?.isInactive}
                        onChange={clientIndividualFormValidation.handleChange}
                      />
                    }
                    label={_labels?.mobileVerified}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="OTPVerified"
                        disabled={true}
                        checked={
                          clientIndividualFormValidation.values?.OTPVerified
                        }
                        onChange={clientIndividualFormValidation.handleChange}
                      />
                    }
                    label={_labels?.otpVerified}
                  />
                </Grid>{}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={clientIndividualFormValidation.values.genderId ===2 ? false : true}

                        name="coveredFace"
                        checked={
                          clientIndividualFormValidation.values?.coveredFace
                        }
                        onChange={clientIndividualFormValidation.handleChange}
                      />
                    }
                    label={_labels?.coveredFace}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isEmployee"
                        checked={
                          clientIndividualFormValidation.values?.isEmployee
                        }
                        onChange={clientIndividualFormValidation.handleChange}
                      />
                    }
                    label={_labels?.isEmployed}
                  />
                </Grid>
              </Grid>

              <Grid container xs={6} spacing={2} sx={{ paddingTop: "15px" }}>
                <Grid container xs={12}>
                  <FieldSet title={_labels.diplomat}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="isDiplomatic"
                            checked={
                              clientIndividualFormValidation.values?.isInactive
                            }
                            onChange={
                              clientIndividualFormValidation.handleChange
                            }
                          />
                        }
                        label={_labels?.isDiplomat}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="isRelativeDiplomate"
                            checked={
                              clientIndividualFormValidation.values?.isInactive
                            }
                            onChange={
                              clientIndividualFormValidation.handleChange
                            }
                          />
                        }
                        label={_labels?.isDiplomatRelative}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name="relativeDiplomateInfo"
                        label={_labels.relativeDiplomateInfo}
                        value={
                          clientIndividualFormValidation.values
                            ?.relativeDiplomateInfo
                        }
                        onChange={clientIndividualFormValidation.handleChange}
                        maxLength="10"
                        onClear={() =>
                          clientIndividualFormValidation.setFieldValue(
                            "relativeDiplomateInfo",
                            "",
                          )
                        }
                        error={
                          clientIndividualFormValidation.touched
                            .relativeDiplomateInfo &&
                          Boolean(
                            clientIndividualFormValidation.errors
                              .relativeDiplomateInfo,
                          )
                        }
                        helperText={
                          clientIndividualFormValidation.touched
                            .relativeDiplomateInfo &&
                          clientIndividualFormValidation.errors
                            .relativeDiplomateInfo
                        }
                      />
                    </Grid>
                  </FieldSet>
                </Grid>
              </Grid>

            </Grid>




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
        >
        </Grid>
      </Grid>
            </Grid>
        </>
    )
}

export default ClientTab
