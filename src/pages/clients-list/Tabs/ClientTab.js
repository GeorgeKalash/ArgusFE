// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

import { useEffect, useState } from 'react'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

// ** Helpers

import AddressTab from 'src/components/Shared/AddressTab'
import FieldSet from 'src/components/Shared/FieldSet'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomLookup from 'src/components/Inputs/CustomLookup'
import { TextFieldReference } from 'src/components/Shared/TextFieldReference'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'

const ClientTab = ({
  clientIndividualFormValidation,
  WorkAddressValidation,
  countryStore,
  cityStore,
  requiredOptional,
  setCityStore,
  cityAddressStore,
  cityDistrictAddressWorkStore,
  cityDistrictAddressStore,
  setCityAddressStore,
  cityAddressWorkStore,
  setCityAddressWorkStore,

  lookupCity,
  lookupCityAddress,
  lookupCityAddressWork,
  lookupCityDistrictAddress,
  lookupCityDistrictAddressWork,
  types,
  professionFilterStore,
  fillFilterProfession,

  salaryRangeStore,
  incomeOfSourceStore,
  smsLanguageStore,
  civilStatusStore,
  genderStore,
  mobileVerifiedStore,
  fillStateStoreAddress,
  fillStateStoreAddressWork,
  stateAddressWorkStore,
  stateAddressStore,
  educationStore,
  idTypeStore,
  titleStore,
  setReferenceRequired,
   _labels, maxAccess, editMode
 }) => {


const [showAsPassword , setShowAsPassword]  = useState(false)
const [showAsPasswordRepeat , setShowAsPasswordRepeat]  = useState(false)
const [showAsPasswordPhone , setShowAsPasswordPhone]  = useState(false)
const [showAsPasswordPhoneRepeat , setShowAsPasswordPhoneRepeat]  = useState(false)

  const encryptDigits = (v) => {
    const input = v?.replace(/\D/g, '')

    if(input?.length > 0){

    const showLength = Math.max(0, input?.length - 4);

    // Check if input has at least four digits

    const maskedValue =
    '*'.repeat(showLength) + input?.substring(showLength);


     return maskedValue;
    }else{

      return ;
    }

  };


  const handleCopy = (event) => {
    event.preventDefault();
  };



return (
        <>
        <Grid container spacing={2}>
        <Grid container xs={12} spacing={2} sx={{ padding: "40px" }}>
        <Grid item xs={6} sx={{ padding: "40px" }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
            <TextFieldReference
                endpointId={CurrencyTradingSettingsRepository.Defaults.get}
                param={'ct-nra-individual'}
                name="reference"
                label={_labels.reference}
                editMode={editMode}
                value={clientIndividualFormValidation.values.reference}
                setReferenceRequired={setReferenceRequired}
                onChange={clientIndividualFormValidation.handleChange}
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
                    disabled={editMode && true}

                  />
                }
                label={_labels.isResident}
              />
            </Grid>

            <Grid container xs={12}></Grid>
            <Grid item xs={12}>
              <FieldSet title={_labels.id}>
              <Grid item xs={12}>
                  <CustomComboBox
                    name="idtId"
                    label={_labels.type}
                    valueField="recordId"
                    displayField="name"
                    readOnly={editMode && true}
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
                        fillFilterProfession(newValue.isDiplomat)
                        }else{
                        fillFilterProfession('')
                        }

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
                <Grid item xs={12} sx={{position: 'relative', width: '100%'}}>
                  <CustomTextField
                  sx={{color: 'white'}}
                    name="idNo"
                    label={_labels.number}
                    type={ showAsPassword && "password"}
                    value={clientIndividualFormValidation.values?.idNo }
                    required
                    onChange={ (e) =>{ clientIndividualFormValidation.handleChange(e) }}
                    onCopy={handleCopy}
                    onPaste={handleCopy}
                    readOnly={editMode && true}
                    maxLength="15"
                    onBlur={(e) =>{ setShowAsPassword(true) }}
                    onFocus={(e) =>{ setShowAsPassword(false) }}

                    onClear={() =>{
                      clientIndividualFormValidation.setFieldValue("idNo", "")

                    }

                    }
                    error={
                      clientIndividualFormValidation.touched.idNo &&
                      Boolean(clientIndividualFormValidation.errors.idNo)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.idNo &&
                      clientIndividualFormValidation.errors.idNo
                    }
                  />
                          {/* <Grid

                           sx={{
                              // position: 'absolute',
                              width: '88%',
                              height: clientIndividualFormValidation.touched.idNo ? '50%': '70%',
                              top:  '10px',
                              letterSpacing: "3px",
                              marginLeft:'10px',
                              marginRight:'10px',
                              color:'#424242',
                              paddingTop: '5px',
                              backgroundColor: '#fff',
                              pointerEvents: 'none',
                              fontFamily: 'Arial'
                          }}
                          >{encryptDigits(clientIndividualFormValidation.values?.idNo)}</Grid> */}

                </Grid>
                <Grid item xs={12}
                sx={{position: 'relative', width: '100%',}}>
                  <CustomTextField
                    name="idNoRepeat"
                    label={_labels.confirmNb}
                    value={clientIndividualFormValidation.values?.idNoRepeat}
                    required
                    type={ showAsPasswordRepeat && "password"}

                    onChange={ (e) =>{ clientIndividualFormValidation.handleChange(e) }}

                    // onBlur={clientIndividualFormValidation.handleBlur}
                    onCopy={handleCopy}
                    onPaste={handleCopy}
                    readOnly={editMode && true}

                    onBlur={(e) =>{ setShowAsPasswordRepeat(true) , clientIndividualFormValidation.handleBlur(e)}}

                    onFocus={(e) =>{ setShowAsPasswordRepeat(false) }}

                    maxLength="15"
                    onClear={() =>{
                      clientIndividualFormValidation.setFieldValue("idNoRepeat", "")
                      clientIndividualFormValidation.setFieldValue("idNoRepeat", "")}

                    }
                    error={
                      clientIndividualFormValidation.touched.idNoRepeat &&
                      Boolean(clientIndividualFormValidation.errors.idNoRepeat)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.idNoRepeat &&
                      clientIndividualFormValidation.errors.idNoRepeat
                    }
                  />
                  {/* <Grid
                     sx={{
                      position: 'absolute',
                      width: '88%',
                      height: clientIndividualFormValidation.touched.idNoRepeat ? '50%': '70%',
                      top:  '10px',
                      letterSpacing: "3px",
                      marginLeft:'10px',
                      marginRight:'10px',
                      color:'#424242',
                      paddingTop: '5px',
                      backgroundColor: '#fff',
                      pointerEvents: 'none',
                      fontFamily: 'Arial'

                          }}
                          >
                            {encryptDigits(clientIndividualFormValidation.values?.idNoRepeat)}</Grid> */}
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name="expiryDate"
                    label={_labels.expiryDate}
                    value={clientIndividualFormValidation.values?.expiryDate}
                    readOnly={editMode && true}
                    required={true}
                    onChange={clientIndividualFormValidation.setFieldValue}
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "expiryDate",
                        "",
                      )
                    }
                    disabledDate={'<'}
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
                    readOnly={editMode && true}
                    disabledDate={'>'}

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
                    label={_labels.issusCountry}
                    valueField="recordId"
                    displayField={['reference','name','flName']}
                    readOnly={editMode && true}
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
                      setCityStore([])

                      if(newValue){


                      clientIndividualFormValidation.setFieldValue(
                        "idCountry",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "country",
                        newValue?.name,

                      );


                      clientIndividualFormValidation.setFieldValue(
                        "idCity",
                        ''
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "cityName",
                        ''
                      );


                    }else{

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
                          ''
                        );
                        clientIndividualFormValidation.setFieldValue(
                          "cityName",
                          ''
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
              name='idCity'
              label={_labels.issusPlace}

              valueField='name'
              displayField='name'
              store={cityStore}
              setStore={setCityStore}
              onLookup={lookupCity}
              firstValue={clientIndividualFormValidation.values.cityName}
              secondDisplayField={false}
              readOnly={(editMode || clientIndividualFormValidation.values.idCountry) && true}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                if (newValue) {
                  clientIndividualFormValidation.setFieldValue(
                    "idCity",
                    newValue?.recordId,
                  );
                  clientIndividualFormValidation.setFieldValue(
                    "cityName",
                    newValue?.name,
                  );
                } else {
                  clientIndividualFormValidation.setFieldValue(
                    "idCity",
                    null,
                  );
                  clientIndividualFormValidation.setFieldValue(
                    "cityName",
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
               <AddressTab labels={_labels} addressValidation={clientIndividualFormValidation} countryStore={countryStore} cityStore={cityAddressStore} setCityStore={setCityAddressStore}  lookupCity={lookupCityAddress} stateStore={stateAddressStore} cityDistrictStore={cityDistrictAddressStore} lookupCityDistrict={lookupCityDistrictAddress} fillStateStore={fillStateStoreAddress} readOnly={editMode && true} />
               </FieldSet>
                {/* <Grid item xs={12}>
                  <CustomTextField
                    name="whatsAppNo"
                    label={_labels.whatsapp}
                    value={clientIndividualFormValidation.values?.whatsAppNo}
                    required
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "whatsAppNo",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.whatsAppNo &&
                      Boolean(clientIndividualFormValidation.errors.whatsAppNo)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.whatsAppNo &&
                      clientIndividualFormValidation.errors.whatsAppNo
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
                    displayField={["min", "->",  "max"]}
                    columnsInDropDown={[
                      { key: "min", value: "min" },
                      { key: "max", value: "max" },
                    ]}
                    readOnly={editMode && true}
                    store={salaryRangeStore}
                    value={
                      salaryRangeStore.filter(
                        (item) =>
                          item.recordId ===
                          clientIndividualFormValidation.values.salaryRangeId,
                      )[0]
                    }
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
                    readOnly={editMode && true}

                    // readOnly //disabled
                    valueField="recordId"
                    displayField="name"
                    store={countryStore}
                    value={
                      countryStore.filter(
                        (item) =>
                          item.recordId ===
                          clientIndividualFormValidation.values.riskLevel,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "riskLevel",
                        newValue?.recordId,
                      );
                     }else{

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
                      clientIndividualFormValidation.values.smsLanguage &&   smsLanguageStore.filter(
                        (item) =>
                          item.key ==
                          clientIndividualFormValidation.values.smsLanguage,
                      )[0]
                    }
                    required

                    readOnly={editMode && true}
                    onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "smsLanguage",
                        newValue?.key,
                      );

                    }else{

                        clientIndividualFormValidation.setFieldValue(
                          "smsLanguage",
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
                    value={
                      civilStatusStore.filter(
                        (item) =>
                          item.key ===
                          clientIndividualFormValidation.values.civilStatus,
                      )[0]
                    }
                    readOnly={editMode && true}
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
                  readOnly={editMode && true}
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
                    name="whatsAppNo"
                    label={_labels.whatsapp}
                    value={clientIndividualFormValidation.values?.whatsAppNo}
                    readOnly={editMode && true}
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="15"
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "whatsAppNo",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.whatsAppNo &&
                      Boolean(clientIndividualFormValidation.errors.whatsAppNo)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.whatsAppNo &&
                      clientIndividualFormValidation.errors.whatsAppNo
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
                    readOnly={editMode && true}
                    value={
                      titleStore.filter(
                        (item) =>
                          item.key ===
                          clientIndividualFormValidation.values.title,
                      )[0]
                    }
                      onChange={(event, newValue) => {

                      if(newValue){
                      clientIndividualFormValidation.setFieldValue(
                        "title",
                        newValue?.key,
                      );

                      }else{
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
              <Grid item xs={6} sx={{position: 'relative', width: '100%'}}>
                <CustomTextField
                  name="cellPhone"
                  type={showAsPasswordPhone && "password"}
                  phone={true}
                  label={_labels.cellPhone}
                  value={clientIndividualFormValidation.values?.cellPhone}
                  readOnly={editMode && true}
                  required
                  onChange={clientIndividualFormValidation.handleChange}
                  maxLength="15"

                  onCopy={handleCopy}
                  onPaste={handleCopy}

                  onBlur={(e) =>{ setShowAsPasswordPhone(true) , clientIndividualFormValidation.handleBlur(e)}}
                  onFocus={(e) =>{ setShowAsPasswordPhone(false) }}
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
                 {/* <Grid
                          sx={{
                            position: 'absolute',
                            top:  '15px',

                            letterSpacing: "3px",
                            marginLeft:'15px',
                            padding: '0px',
                            backgroundColor: '#fff',
                            pointerEvents: 'none',
                            fontFamily: 'Arial'
                        }}
                          >{encryptDigits(clientIndividualFormValidation.values?.cellPhone)}</Grid> */}
              </Grid>
              <Grid item xs={6} sx={{position: 'relative', width: '100%'}}>
                <CustomTextField
                  name="cellPhoneRepeat"
                  type={showAsPasswordPhoneRepeat && 'password'}
                  label={_labels.confirmCell}
                  value={clientIndividualFormValidation.values?.cellPhoneRepeat}
                  phone={true}
                  required
                  readOnly={editMode && true}
                  maxLength="15"
                  onChange={ (e) =>{ clientIndividualFormValidation.handleChange(e)  }}
                  onBlur={(e) =>{ setShowAsPasswordPhoneRepeat(true) , clientIndividualFormValidation.handleBlur(e)}}
                  onFocus={(e) =>{ setShowAsPasswordPhoneRepeat(false) }}


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


                  helperText={
                    clientIndividualFormValidation.touched.cellPhoneRepeat &&
                    clientIndividualFormValidation.errors.cellPhoneRepeat
                  }
                />
                 {/* <Grid
                         sx={{
                          position: 'absolute',
                          top:  '15px',
                          letterSpacing: "3px",
                          marginLeft:'15px',
                          padding: '0px',
                          backgroundColor: '#fff',
                          pointerEvents: 'none',
                          fontFamily: 'Arial'
                      }}
                          >{encryptDigits(clientIndividualFormValidation.values.cellPhoneRepeat)}</Grid> */}
              </Grid>
              <Grid container  spacing={2} sx={{paddingTop: '20px'}} >
                <Grid item xs={3}>
                  <CustomTextField
                    name="firstName"
                    label={_labels.first}
                    value={clientIndividualFormValidation.values?.firstName}
                    required
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    readOnly={editMode && true}
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
                    readOnly={editMode && true}
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
                    readOnly={editMode && true}
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
                    readOnly={editMode && true}
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

                </Grid>



  <Grid container  spacing={2} sx={{ flexDirection: 'row-reverse' , paddingTop:'5px'}} >
  <Grid item xs={3}>
                  <CustomTextField
                    name="fl_firstName"
                    label={_labels.fl_first}
                    value={clientIndividualFormValidation.values?.fl_firstName}
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    readOnly={editMode && true}
                    dir='rtl'// Set direction to right-to-left

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
                <Grid item xs={3}>
                  <CustomTextField
                    name="fl_middleName"
                    label={_labels.fl_middle}
                    value={clientIndividualFormValidation.values?.fl_middleName}
                    onChange={clientIndividualFormValidation.handleChange}
                    readOnly={editMode && true}
                    dir='rtl'// Set direction to right-to-left

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
                    name="fl_lastName"
                    label={_labels.fl_last}
                    value={clientIndividualFormValidation.values?.fl_lastName}
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength="10"
                    dir='rtl'// Set direction to right-to-left

                    readOnly={editMode && true}
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
                    name="fl_familyName"
                    label={_labels.fl_family}
                    value={clientIndividualFormValidation.values?.fl_familyName}
                    onChange={clientIndividualFormValidation.handleChange}
                    readOnly={editMode && true}
                    dir='rtl'// Set direction to right-to-left

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




                </Grid>
                <Grid item xs={12}>
                <CustomComboBox
                  name="nationalityId"
                  label={_labels.nationality}
                  valueField="recordId"

                  // displayField="name"
                  store={countryStore}
                   displayField={['reference','name','flName']}

                  columnsInDropDown= {[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' },
                    { key: 'flName', value: 'Foreign Language Name' }
                  ]}
                  readOnly={editMode && true}
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
                disabledDate={'>='}
                readOnly={editMode && true}

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
                    readOnly={editMode && true}
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
                    readOnly={editMode && true}

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
                    readOnly={editMode && true}
                    displayField={['reference','name','flName']}

                    columnsInDropDown= {[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'Foreign Language Name' }
                    ]}
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


                {/* <Grid item xs={12}>
                  <CustomTextField
                    name="salary"
                    label='salary'    //{_labels.whatsapp}
                    value={clientIndividualFormValidation.values?.salary}

                    onChange={clientIndividualFormValidation.handleChange}
                    onClear={() =>
                      clientIndividualFormValidation.setFieldValue(
                        "salary",
                        "",
                      )
                    }
                    error={
                      clientIndividualFormValidation.touched.salary &&
                      Boolean(clientIndividualFormValidation.errors.salary)
                    }
                    helperText={
                      clientIndividualFormValidation.touched.salary &&
                      clientIndividualFormValidation.errors.salary
                    }
                  />
                </Grid> */}

                <Grid item xs={12}>
                  <CustomTextField
                    name="sponsorName"
                    label={_labels.sponsor}
                    value={clientIndividualFormValidation.values?.sponsorName}
                    readOnly={editMode && true}
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
                  displayField={['reference','name','flName']}

                  columnsInDropDown= {[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' },
                    { key: 'flName', value: 'Foreign Language Name' }
                  ]}
                  store={professionFilterStore}
                  readOnly={editMode && true}
                  value={
                    professionFilterStore.filter(
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
              <AddressTab labels={_labels} addressValidation={WorkAddressValidation} countryStore={countryStore} cityStore={cityAddressWorkStore} setCityStore={setCityAddressWorkStore} lookupCity={lookupCityAddressWork}  stateStore={stateAddressWorkStore}   fillStateStore={fillStateStoreAddressWork} lookupCityDistrict={lookupCityDistrictAddressWork} cityDistrictStore={cityDistrictAddressWorkStore} requiredOptional={requiredOptional} readOnly={editMode && true} />

               </FieldSet>
               </Grid>

               <Grid container xs={6} spacing={2} sx={{ padding: "5px" }}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="OTPVerified"
                        disabled={true}
                        readOnly={editMode && true}
                        checked={clientIndividualFormValidation.values?.OTPVerified}
                        onChange={clientIndividualFormValidation.handleChange}
                      />
                    }
                    label={_labels?.OTPVerified}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomComboBox
                    name="mobileVerified"
                    label={_labels.mobileVerified}
                    valueField="key"
                    displayField="value"
                    store={mobileVerifiedStore && mobileVerifiedStore}
                    value={
                      mobileVerifiedStore &&    mobileVerifiedStore.filter(
                        (item) =>
                          item.key ===
                          clientIndividualFormValidation.values.mobileVerified,
                      )[0]
                    }
                    readOnly
                    onChange={(event, newValue) => {
                      clientIndividualFormValidation.setFieldValue(
                        "mobileVerified",
                        newValue?.recordId,
                      );
                      clientIndividualFormValidation.setFieldValue(
                        "mobileVerifiedName",
                        newValue?.name,
                      );
                    }}
                    error={
                      clientIndividualFormValidation.touched.mobileVerified &&
                      Boolean(
                        clientIndividualFormValidation.errors.mobileVerified,
                      )
                    }
                    helperText={
                      clientIndividualFormValidation.touched.mobileVerified &&
                      clientIndividualFormValidation.errors.mobileVerified
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={clientIndividualFormValidation.values.genderId ===2 ? editMode? true : false : true}
                        readOnly={editMode && true}
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
                        disabled={editMode && true}
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
                            name="isDiplomat"
                            checked={
                              clientIndividualFormValidation.values?.isDiplomat
                            }

                            disabled={(clientIndividualFormValidation.values?.isDiplomatReadOnly || editMode) && true}
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
                            name="isRelativeDiplomat"
                            checked={
                              clientIndividualFormValidation.values?.isRelativeDiplomat
                            }
                            disabled={editMode && true}

                            onChange={(e)=>{
                              clientIndividualFormValidation.handleChange(e), clientIndividualFormValidation.setFieldValue('relativeDiplomatInfo', '') }
                            }
                          />
                        }
                        label={_labels?.isDiplomatRelative}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name="relativeDiplomatInfo"
                        label={_labels.relativeDiplomatInfo}
                        onBlur={clientIndividualFormValidation.handleBlur}
                        value={
                          clientIndividualFormValidation.values?.relativeDiplomatInfo
                        }
                        readOnly={editMode || !clientIndividualFormValidation.values?.isRelativeDiplomat  && true}

                        onChange={clientIndividualFormValidation.handleChange}
                        maxLength="10"
                        required={clientIndividualFormValidation.values.isRelativeDiplomat ? true : false}
                        onClear={() =>
                         clientIndividualFormValidation.setFieldValue(
                            "relativeDiplomatInfo",
                            "",
                          )
                        }
                        error={
                          clientIndividualFormValidation.touched
                            .relativeDiplomatInfo &&
                          Boolean(
                            clientIndividualFormValidation.errors
                              .relativeDiplomatInfo,
                          )
                        }
                        helperText={
                          clientIndividualFormValidation.touched
                            .relativeDiplomatInfo &&
                          clientIndividualFormValidation.errors
                            .relativeDiplomatInfo
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
