// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'
import {Paper, Typography } from '@mui/material';

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import Window from 'src/components/Shared/Window'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { CommonContext } from 'src/providers/CommonContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomLookup from 'src/components/Inputs/CustomLookup'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { position } from 'stylis'
import FieldSet from 'src/components/Shared/FieldSet';

const Defaults = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)
  const [types, setTypes] = useState([])
  const [countryStore, setCountryStore] = useState([])
  const [cityStore, setCityStore] = useState([])
  const[professionStore, setProfessionStore] = useState([])

  //stores

  const [errorMessage, setErrorMessage] = useState(null)




  useEffect(() => {
    if (!access) getAccess(ResourceIds.ClientMaster, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getLabels(ResourceIds.ClientMaster, setLabels)
         fillType()
         fillCountryStore()

      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }

    // getDataResult()
  }, [access])

  const _labels = {
     reference: labels && labels.find(item => item.key === 1).value,
     dateBirth: labels && labels.find(item => item.key ===2).value,
     isResident: labels && labels.find(item => item.key ===34).value,
     number: labels && labels.find(item => item.key ===5).value,
     type: labels && labels.find(item => item.key ===6).value,
     expiryDate: labels && labels.find(item => item.key ===7).value,
     issusDate: labels && labels.find(item => item.key ===8).value,
     country: labels && labels.find(item => item.key ===9).value,
     city: labels && labels.find(item => item.key ===10).value,
     first: labels && labels.find(item => item.key ===11).value,
     last: labels && labels.find(item => item.key ===12).value,
     middle: labels && labels.find(item => item.key ===13).value,
     family: labels && labels.find(item => item.key ===14).value,
     nationality: labels && labels.find(item => item.key ===15).value,
     profession: labels && labels.find(item => item.key ===16).value,
     cellPhone: labels && labels.find(item => item.key ===17).value,
     status: labels && labels.find(item => item.key ===18).value,
     oldReference: labels && labels.find(item => item.key ===19).value,
     salaryRange: labels && labels.find(item => item.key ===22).value,
     riskLevel: labels && labels.find(item => item.key ===23).value,
     smsLanguage: labels && labels.find(item => item.key ===24).value,
     incomeSource: labels && labels.find(item => item.key ===25).value,
     civilStatus: labels && labels.find(item => item.key ===26).value,
     educationLevel: labels && labels.find(item => item.key ===27).value,
     gender: labels && labels.find(item => item.key ===28).value,
     title: labels && labels.find(item => item.key ===29).value,
     mobileVerified: labels && labels.find(item => item.key ===35).value,

     otpVerified: labels && labels.find(item => item.key ===36).value,
     coveredFace: labels && labels.find(item => item.key ===37).value,
     isEmployed: labels && labels.find(item => item.key ===38).value,

     Diplomat: labels && labels.find(item => item.key ===39).value,
     isDiplomat: labels && labels.find(item => item.key ===40).value,
     isDiplomatRelative: labels && labels.find(item => item.key ===41).value,
     relativeDiplomateInfo : labels && labels.find(item => item.key ===42).value,

     id: labels && labels.find(item => item.key ===30).value,
     name: labels && labels.find(item => item.key ===31).value,
     whatsapp: labels && labels.find(item => item.key ===20).value,
     sponsor: labels && labels.find(item => item.key ===21).value,




  }



  const clientIndividualFormValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,

    onSubmit: values => {

      postRtDefault(values)
    }
  })



  const postRtDefault = obj => {

   var data = []
    Object.entries(obj).forEach(([key, value], i) => {
      // console.log(`Key: ${key}, Value: ${value}`);
      const newObj = { key: key  , value : value };

      // Push the new object into the array
      data.push(newObj);

    })

      postRequest({
        extension: CurrencyTradingSettingsRepository.Defaults.set2,
        record:   JSON.stringify({  sysDefaults  : data })
      })
        .then(res => {
          if (res) toast.success('Record Successfully')
        })
        .catch(error => {
          setErrorMessage(error)
        })
  }

  const handleSubmit = () => {
    clientIndividualFormValidation.handleSubmit()
  }

   const fillType =()=>{
    var parameters = `_filter=`
    getRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.qry,
      parameters: parameters
    })
      .then(res => {
        setTypes(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
   }

   const fillCountryStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Country.qry,
      parameters: parameters
    })
      .then(res => {
        setCountryStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillCityStore = (cId) => {
    var parameters = `_filter=_&countryId=`+cId
    getRequest({
      extension: SystemRepository.City.qry,
      parameters: parameters
    })
      .then(res => {
        setCityStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillProfessionStore = (cId) => {
    var parameters = `_filter=_&countryId=`+cId
    getRequest({
      extension: SystemRepository.City.qry,
      parameters: parameters
    })
      .then(res => {
        setProfessionStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

return (
    <>
      <Grid container xs={12} spacing={2} sx={{padding:'40px'}}>
        <Grid item  xs={5} sx={{padding:'40px'}}>

        <Grid container spacing={2} >
           <Grid item xs={6} >
            <CustomTextField
              name='reference'
              label={_labels.reference}
              value={clientIndividualFormValidation.values?.reference}
              required
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('reference', '')}
              error={clientIndividualFormValidation.touched.reference && Boolean(clientIndividualFormValidation.errors.reference)}
              helperText={clientIndividualFormValidation.touched.reference && clientIndividualFormValidation.errors.reference}
            />
          </Grid>
          <Grid item xs={6}>
        <FormControlLabel
          control={
            <Checkbox
              name='isResident'
              checked={clientIndividualFormValidation.values?.isResident}
              onChange={clientIndividualFormValidation.handleChange}
            />
          }
          label={_labels.isResident}
        />
      </Grid>

      <Grid item xs={12} >
            <CustomDatePicker
              name='birthDate'
              label={_labels.birthDate}
              value={ clientIndividualFormValidation.values?.birthDate}
              required={true}
              onChange={clientIndividualFormValidation.handleChange}
              onClear={() => clientIndividualFormValidation.setFieldValue('birthDate', '')}
              error={clientIndividualFormValidation.touched.birthDate && Boolean(clientIndividualFormValidation.errors.birthDate)}
              helperText={clientIndividualFormValidation.touched.birthDate && clientIndividualFormValidation.errors.birthDate}
            />
          </Grid>

          <Grid container xs={12}>

          </Grid>
          <Grid item xs={12}  >


          <FieldSet title={_labels.id}>
                <Grid item xs={12} >
                  <CustomTextField
                    name='number'
                    label={_labels.number}
                    value={clientIndividualFormValidation.values?.number}
                    required
                    onChange={clientIndividualFormValidation.handleChange}
                    maxLength = '10'
                    onClear={() => clientIndividualFormValidation.setFieldValue('number', '')}
                    error={clientIndividualFormValidation.touched.number && Boolean(clientIndividualFormValidation.errors.number)}
                    helperText={clientIndividualFormValidation.touched.number && clientIndividualFormValidation.errors.number}
                  />
                </Grid>
                <Grid item xs={12}>
                                <CustomComboBox
                                    name='type'
                                    label={_labels.type}

                                    valueField='recordId'
                                    displayField='name'
                                    store={types}
                                    value={clientIndividualFormValidation.values?.type}
                                    required
                                    onChange={(event, newValue) => {
                                        clientIndividualFormValidation.setFieldValue('typeId', newValue?.recordId)
                                        clientIndividualFormValidation.setFieldValue('typeName', newValue?.name)
                                    }}
                                    error={clientIndividualFormValidation.touched.typeId && Boolean(clientIndividualFormValidation.errors.typeId)}
                                    helperText={clientIndividualFormValidation.touched.typeId && clientIndividualFormValidation.errors.typeId}
                                />
               </Grid>
                <Grid item xs={12} >
            <CustomDatePicker
              name='expiryDate'
              label={_labels.expiryDate}
              value={ clientIndividualFormValidation.values?.expiryDate}
              required={true}
              onChange={clientIndividualFormValidation.handleChange}
              onClear={() => clientIndividualFormValidation.setFieldValue('expiryDate', '')}
              error={clientIndividualFormValidation.touched.expiryDate && Boolean(clientIndividualFormValidation.errors.expiryDate)}
              helperText={clientIndividualFormValidation.touched.expiryDate && clientIndividualFormValidation.errors.expiryDate}
            />
          </Grid>

          <Grid item xs={12} >
            <CustomDatePicker
              name='birthDate'
              label={_labels.issusDate}
              value={ clientIndividualFormValidation.values?.issusDate}
              required={true}
              onChange={clientIndividualFormValidation.handleChange}
              onClear={() => clientIndividualFormValidation.setFieldValue('issusDate', '')}
              error={clientIndividualFormValidation.touched.issusDate && Boolean(clientIndividualFormValidation.errors.issusDate)}
              helperText={clientIndividualFormValidation.touched.issusDate && clientIndividualFormValidation.errors.issusDate}
            />
          </Grid>

          <Grid item xs={12}>
                                <CustomComboBox
                                    name='countryId'
                                    label={_labels.country}                                    valueField='recordId'
                                    displayField='name'
                                    store={countryStore}
                                    value={clientIndividualFormValidation.values?.type}
                                    required
                                    onChange={(event, newValue) => {
                                        clientIndividualFormValidation.setFieldValue('countryId', newValue?.recordId)
                                        clientIndividualFormValidation.setFieldValue('countryName', newValue?.name)
                                    }}
                                    error={clientIndividualFormValidation.touched.countryId && Boolean(clientIndividualFormValidation.errors.countryId)}
                                    helperText={clientIndividualFormValidation.touched.countryId && clientIndividualFormValidation.errors.countryId}
                                />
                            </Grid>


                            <Grid item xs={12}>
                                <CustomComboBox
                                    name='cityId'
                                    label={_labels.city}                                    valueField='recordId'
                                    displayField='name'
                                    store={cityStore}
                                    value={clientIndividualFormValidation.values?.type}
                                    required
                                    onChange={(event, newValue) => {
                                        clientIndividualFormValidation.setFieldValue('cityId', newValue?.recordId)
                                        clientIndividualFormValidation.setFieldValue('cityName', newValue?.name)
                                    }}
                                    error={clientIndividualFormValidation.touched.cityId && Boolean(clientIndividualFormValidation.errors.cityId)}
                                    helperText={clientIndividualFormValidation.touched.cityId && clientIndividualFormValidation.errors.cityId}
                                />
                            </Grid>
                </FieldSet>
                <Grid container xs={12} sx={{paddingTop:'10px'}} spacing={2}
         >
            <Grid item xs={12} >
                <CustomTextField
              name='whatsapp'
              label={_labels.whatsapp}
              value={clientIndividualFormValidation.values?.whatsapp}
              required
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('whatsapp', '')}
              error={clientIndividualFormValidation.touched.whatsapp && Boolean(clientIndividualFormValidation.errors.whatsapp)}
              helperText={clientIndividualFormValidation.touched.whatsapp && clientIndividualFormValidation.errors.whatsapp}
            />
            </Grid>
            <Grid item xs={12} >
              <CustomTextField
              name='sponsor'
              label={_labels.sponsor}
              value={clientIndividualFormValidation.values?.sponsor}
              required
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('sponsor', '')}
              error={clientIndividualFormValidation.touched.sponsor && Boolean(clientIndividualFormValidation.errors.sponsor)}
              helperText={clientIndividualFormValidation.touched.sponsor && clientIndividualFormValidation.errors.sponsor}
            />
            </Grid>
            </Grid>
          </Grid>
          </Grid>
        </Grid>

        <Grid item xs={7}  >
        <Grid container xs={12}  spacing={2} >


        <Grid item xs={5}  >
        <FieldSet title={_labels.name} >
             <Grid item xs={12} >
            <CustomTextField
              name='name'
              label={_labels.first}
              value={clientIndividualFormValidation.values?.name}
              required
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('reference', '')}
              error={clientIndividualFormValidation.touched.name && Boolean(clientIndividualFormValidation.errors.name)}
              helperText={clientIndividualFormValidation.touched.name && clientIndividualFormValidation.errors.name}
            />
          </Grid>

          <Grid item xs={12} >
          <CustomTextField
              name='last'
              label={_labels.last}
              value={clientIndividualFormValidation.values?.last}
              required
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('family', '')}
              error={clientIndividualFormValidation.touched.last && Boolean(clientIndividualFormValidation.errors.last)}
              helperText={clientIndividualFormValidation.touched.last && clientIndividualFormValidation.errors.last}
            />
          </Grid>
          <Grid item xs={12} >
          <CustomTextField
              name='middle'
              label={_labels.middle}
              value={clientIndividualFormValidation.values?.middle}
              required
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('reference', '')}
              error={clientIndividualFormValidation.touched.name && Boolean(clientIndividualFormValidation.errors.name)}
              helperText={clientIndividualFormValidation.touched.name && clientIndividualFormValidation.errors.name}
            />
          </Grid>

          <Grid item xs={12} >
          <CustomTextField
              name='family'
              label={_labels.family}
              value={clientIndividualFormValidation.values?.family}
              required
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('family', '')}
              error={clientIndividualFormValidation.touched.family && Boolean(clientIndividualFormValidation.errors.family)}
              helperText={clientIndividualFormValidation.touched.family && clientIndividualFormValidation.errors.family}
            />
          </Grid>
       </FieldSet>
       </Grid>
       <Grid item xs={5} sx={{margin:'10px'}} >
        <FieldSet title={_labels.name} >
             <Grid item xs={12} >
            <CustomTextField
              name='name'
              label={_labels.first}
              value={clientIndividualFormValidation.values?.name}
              required
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('reference', '')}
              error={clientIndividualFormValidation.touched.name && Boolean(clientIndividualFormValidation.errors.name)}
              helperText={clientIndividualFormValidation.touched.name && clientIndividualFormValidation.errors.name}
            />
          </Grid>

          <Grid item xs={12} >
          <CustomTextField
              name='last'
              label={_labels.last}
              value={clientIndividualFormValidation.values?.last}
              required
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('family', '')}
              error={clientIndividualFormValidation.touched.last && Boolean(clientIndividualFormValidation.errors.last)}
              helperText={clientIndividualFormValidation.touched.last && clientIndividualFormValidation.errors.last}
            />
          </Grid>
          <Grid item xs={12} >
          <CustomTextField
              name='middle'
              label={_labels.middle}
              value={clientIndividualFormValidation.values?.middle}
              required
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('reference', '')}
              error={clientIndividualFormValidation.touched.name && Boolean(clientIndividualFormValidation.errors.name)}
              helperText={clientIndividualFormValidation.touched.name && clientIndividualFormValidation.errors.name}
            />
          </Grid>

          <Grid item xs={12} >
          <CustomTextField
              name='family'
              label={_labels.family}
              value={clientIndividualFormValidation.values?.family}
              required
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('family', '')}
              error={clientIndividualFormValidation.touched.family && Boolean(clientIndividualFormValidation.errors.family)}
              helperText={clientIndividualFormValidation.touched.family && clientIndividualFormValidation.errors.family}
            />
          </Grid>
       </FieldSet>
       </Grid>
                         <Grid container xs={7} spacing={2}  sx={{paddingLeft:'15px'}} >

                             <Grid item xs={12}>
                                <CustomComboBox
                                    name='nationalityId'
                                    label={_labels.nationality}

                                    valueField='recordId'
                                    displayField='name'
                                    store={countryStore}
                                    value={clientIndividualFormValidation.values?.nationalityId}
                                    required
                                    onChange={(event, newValue) => {
                                        clientIndividualFormValidation.setFieldValue('nationalityId', newValue?.recordId)
                                        clientIndividualFormValidation.setFieldValue('nationalityName', newValue?.name)
                                    }}
                                    error={clientIndividualFormValidation.touched.nationalityId && Boolean(clientIndividualFormValidation.errors.nationalityId)}
                                    helperText={clientIndividualFormValidation.touched.nationalityId && clientIndividualFormValidation.errors.nationalityId}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <CustomComboBox
                                    name='professionId'
                                    label={_labels.profession}

                                    valueField='recordId'
                                    displayField='name'
                                    store={professionStore}
                                    value={clientIndividualFormValidation.values?.professionId}
                                    required
                                    onChange={(event, newValue) => {
                                        clientIndividualFormValidation.setFieldValue('professionId', newValue?.recordId)
                                        clientIndividualFormValidation.setFieldValue('professionName', newValue?.name)
                                    }}
                                    error={clientIndividualFormValidation.touched.professionId && Boolean(clientIndividualFormValidation.errors.professionId)}
                                    helperText={clientIndividualFormValidation.touched.professionId && clientIndividualFormValidation.errors.professionId}
                                />
                            </Grid>

                            <Grid item xs={12} >
            <CustomTextField
              name='cellPhone'
              label={_labels.cellPhone}
              value={clientIndividualFormValidation.values?.cellPhone}
              required
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('cellPhone', '')}
              error={clientIndividualFormValidation.touched.cellPhone && Boolean(clientIndividualFormValidation.errors.cellPhone)}
              helperText={clientIndividualFormValidation.touched.cellPhone && clientIndividualFormValidation.errors.cellPhone}
            />
          </Grid>


          <Grid item xs={12} >
            <CustomTextField
              name='status'
              label={_labels.status}
              value={clientIndividualFormValidation.values?.status}
              required
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('status', '')}
              error={clientIndividualFormValidation.touched.status && Boolean(clientIndividualFormValidation.errors.status)}
              helperText={clientIndividualFormValidation.touched.status && clientIndividualFormValidation.errors.status}
            />
          </Grid>

          <Grid item xs={12} >
            <CustomTextField
              name='oldReference'
              label={_labels.oldReference}
              value={clientIndividualFormValidation.values?.oldReference}
              required
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('oldReference', '')}
              error={clientIndividualFormValidation.touched.oldReference && Boolean(clientIndividualFormValidation.errors.oldReference)}
              helperText={clientIndividualFormValidation.touched.oldReference && clientIndividualFormValidation.errors.oldReference}
            />
          </Grid>
  </Grid>
                          <Grid container spacing={2}  sx={{margin:'20px'}} >
                            <Grid container xs={6} spacing={2}  sx={{padding:'5px'}} >



                              <Grid item xs={12}>
                                <CustomComboBox
                                    name='salaryRangeId'
                                    label={_labels.salaryRange}

                                    valueField='recordId'
                                    displayField='name'
                                    store={countryStore}
                                    value={clientIndividualFormValidation.values?.salaryRangeId}
                                    required
                                    onChange={(event, newValue) => {
                                        clientIndividualFormValidation.setFieldValue('salaryRangeId', newValue?.recordId)
                                        clientIndividualFormValidation.setFieldValue('salaryRange', newValue?.name)
                                    }}
                                    error={clientIndividualFormValidation.touched.salaryRangeId && Boolean(clientIndividualFormValidation.errors.salaryRangeId)}
                                    helperText={clientIndividualFormValidation.touched.salaryRangeId && clientIndividualFormValidation.errors.salaryRangeId}
                                />
                               </Grid>

                            <Grid item xs={12}>
                                <CustomComboBox
                                    name='riskLevelId'
                                    label={_labels.riskLevel}

                                    valueField='recordId'
                                    displayField='name'
                                    store={countryStore}
                                    value={clientIndividualFormValidation.values?.riskLevelId}
                                    required
                                    onChange={(event, newValue) => {
                                        clientIndividualFormValidation.setFieldValue('riskLevelId', newValue?.recordId)
                                        clientIndividualFormValidation.setFieldValue('riskLevel', newValue?.name)
                                    }}
                                    error={clientIndividualFormValidation.touched.riskLevelId && Boolean(clientIndividualFormValidation.errors.riskLevelId)}
                                    helperText={clientIndividualFormValidation.touched.riskLevelId && clientIndividualFormValidation.errors.riskLevelId}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <CustomComboBox
                                    name='smsLanguage'
                                    label={_labels.smsLanguage}

                                    valueField='recordId'
                                    displayField='name'
                                    store={countryStore}
                                    value={clientIndividualFormValidation.values?.smsLanguageId}
                                    required
                                    onChange={(event, newValue) => {
                                        clientIndividualFormValidation.setFieldValue('smsLanguageId', newValue?.recordId)
                                        clientIndividualFormValidation.setFieldValue('smsLanguage', newValue?.name)
                                    }}
                                    error={clientIndividualFormValidation.touched.smsLanguageId && Boolean(clientIndividualFormValidation.errors.smsLanguageId)}
                                    helperText={clientIndividualFormValidation.touched.smsLanguageId && clientIndividualFormValidation.errors.smsLanguageId}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <CustomComboBox
                                    name='nationalityId'
                                    label={_labels.nationality}

                                    valueField='recordId'
                                    displayField='name'
                                    store={countryStore}
                                    value={clientIndividualFormValidation.values?.nationalityId}
                                    required
                                    onChange={(event, newValue) => {
                                        clientIndividualFormValidation.setFieldValue('nationalityId', newValue?.recordId)
                                        clientIndividualFormValidation.setFieldValue('nationalityName', newValue?.name)
                                    }}
                                    error={clientIndividualFormValidation.touched.nationalityId && Boolean(clientIndividualFormValidation.errors.nationalityId)}
                                    helperText={clientIndividualFormValidation.touched.nationalityId && clientIndividualFormValidation.errors.nationalityId}
                                />
                            </Grid>
                            </Grid>
                            <Grid container xs={6} spacing={2}   sx={{padding:'5px'}} >
                            <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name='mobileVerified'

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
              name='otpVerified'
              checked={clientIndividualFormValidation.values?.otpVerified}
              onChange={clientIndividualFormValidation.handleChange}
            />
          }
          label={_labels?.otpVerified}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name='isInactive'
              checked={clientIndividualFormValidation.values?.isInactive}
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
              name='isInactive'
              checked={clientIndividualFormValidation.values?.isInactive}
              onChange={clientIndividualFormValidation.handleChange}
            />
          }
          label={_labels?.isEmployed}
        />
      </Grid>

                            </Grid>
                            <Grid container xs={6} spacing={2}  sx={{padding:'5px'}}>
                            <Grid item xs={12}>
                                <CustomComboBox
                                    name='incomeSourceId'
                                    label={_labels.incomeSource}

                                    valueField='recordId'
                                    displayField='name'
                                    store={countryStore}
                                    value={clientIndividualFormValidation.values?.incomeSourceId}
                                    required
                                    onChange={(event, newValue) => {
                                        clientIndividualFormValidation.setFieldValue('incomeSourceId', newValue?.recordId)
                                        clientIndividualFormValidation.setFieldValue('incomeSource', newValue?.name)
                                    }}
                                    error={clientIndividualFormValidation.touched.incomeSourceId && Boolean(clientIndividualFormValidation.errors.incomeSourceId)}
                                    helperText={clientIndividualFormValidation.touched.incomeSourceId && clientIndividualFormValidation.errors.incomeSourceId}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <CustomComboBox
                                    name='civilStatusId'
                                    label={_labels.civilStatus}

                                    valueField='recordId'
                                    displayField='name'
                                    store={countryStore}
                                    value={clientIndividualFormValidation.values?.civilStatusId}
                                    required
                                    onChange={(event, newValue) => {
                                        clientIndividualFormValidation.setFieldValue('civilStatusId', newValue?.recordId)
                                        clientIndividualFormValidation.setFieldValue('civilStatus', newValue?.name)
                                    }}
                                    error={clientIndividualFormValidation.touched.civilStatusId && Boolean(clientIndividualFormValidation.errors.civilStatusId)}
                                    helperText={clientIndividualFormValidation.touched.civilStatusId && clientIndividualFormValidation.errors.civilStatusId}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <CustomComboBox
                                    name='educationLevelId'
                                    label={_labels.educationLevel}

                                    valueField='recordId'
                                    displayField='name'
                                    store={countryStore}
                                    value={clientIndividualFormValidation.values?.educationLevelId}
                                    required
                                    onChange={(event, newValue) => {
                                        clientIndividualFormValidation.setFieldValue('educationLevelId', newValue?.recordId)
                                        clientIndividualFormValidation.setFieldValue('educationLevel', newValue?.name)
                                    }}
                                    error={clientIndividualFormValidation.touched.educationLevelId && Boolean(clientIndividualFormValidation.errors.educationLevelId)}
                                    helperText={clientIndividualFormValidation.touched.educationLevelId && clientIndividualFormValidation.errors.educationLevelId}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <CustomComboBox
                                    name='genderId'
                                    label={_labels.gender}
                                    valueField='recordId'
                                    displayField='name'
                                    store={countryStore}
                                    value={clientIndividualFormValidation.values?.genderId}
                                    required
                                    onChange={(event, newValue) => {
                                        clientIndividualFormValidation.setFieldValue('genderId', newValue?.recordId)
                                        clientIndividualFormValidation.setFieldValue('gender', newValue?.name)
                                    }}
                                    error={clientIndividualFormValidation.touched.genderId && Boolean(clientIndividualFormValidation.errors.genderId)}
                                    helperText={clientIndividualFormValidation.touched.genderId && clientIndividualFormValidation.errors.genderId}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <CustomComboBox
                                    name='titleId'
                                    label={_labels.title}
                                    valueField='recordId'
                                    displayField='name'
                                    store={countryStore}
                                    value={clientIndividualFormValidation.values?.titleId}
                                    required
                                    onChange={(event, newValue) => {
                                        clientIndividualFormValidation.setFieldValue('titleId', newValue?.recordId)
                                        clientIndividualFormValidation.setFieldValue('title', newValue?.name)
                                    }}
                                    error={clientIndividualFormValidation.touched.titleId && Boolean(clientIndividualFormValidation.errors.titleId)}
                                    helperText={clientIndividualFormValidation.touched.titleId && clientIndividualFormValidation.errors.titleId}
                                />
                            </Grid>
                             </Grid>
            <Grid container xs={6} spacing={2} sx={{padding:'15px'}} >


      <Grid container  xs={12}>
        <FieldSet title={_labels.name}>
        <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name='isDiplomat'
              checked={clientIndividualFormValidation.values?.isInactive}
              onChange={clientIndividualFormValidation.handleChange}
            />
          }
          label={_labels?.isDiplomat}
        />
        </Grid>
        <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name='isDiplomatRelative'
              checked={clientIndividualFormValidation.values?.isInactive}
              onChange={clientIndividualFormValidation.handleChange}
            />
          }
          label={_labels?.isDiplomatRelative}
        />
      </Grid>
      <Grid item xs={12} >
            <CustomTextField
              name='relativeDiplomateInfo'
              label={_labels.relativeDiplomateInfo}
              value={clientIndividualFormValidation.values?.relativeDiplomateInfo}
              onChange={clientIndividualFormValidation.handleChange}
              maxLength = '10'
              onClear={() => clientIndividualFormValidation.setFieldValue('relativeDiplomateInfo', '')}
              error={clientIndividualFormValidation.touched.relativeDiplomateInfo && Boolean(clientIndividualFormValidation.errors.relativeDiplomateInfo)}
              helperText={clientIndividualFormValidation.touched.relativeDiplomateInfo && clientIndividualFormValidation.errors.relativeDiplomateInfo}
            />
          </Grid>
      </FieldSet>
      </Grid>


                </Grid>

                </Grid>
                </Grid>
        </Grid>


      <Grid sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          padding: 3,
          textAlign: 'center',
        }}>
          <WindowToolbar onSave={handleSubmit}  />
       </Grid>



      </Grid>


      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Defaults
