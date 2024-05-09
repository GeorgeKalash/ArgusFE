// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox  } from '@mui/material'
import * as yup from 'yup'

// ** Third Party Imports
import { useFormik } from 'formik'
import toast from 'react-hot-toast'

// ** Custom Imports
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataSets } from 'src/resources/DataSets'
import { SystemFunction } from 'src/resources/SystemFunction'
import CustomTextField from 'src/components/Inputs/CustomTextField'


const SystemDefaults = () => {
    const [errorMessage, setErrorMessage] = useState(null)
    const { getRequest, postRequest } = useContext(RequestsContext)

    const [initialValues, setInitialValues] = useState({
        extentionsPath:'',
        baseCurrencyId:null,
        countryId:null,
        vatPct:null,
        dateFormat:null,
        timeZone:null,
        backofficeEmail:'',
        enableHijri:false,
      })
      const editMode = initialValues.baseCurrencyId ? true : false

    useEffect(() => {
        getDataResult();
      }, [])

      const getDataResult = () => {
        const myObject = {};
        var parameters = `_filter=`;
        getRequest({
          extension: SystemRepository.Defaults.qry,
          parameters: parameters
      })
      .then(res => {
          const filteredList = res.list.filter(obj => {
              return (
                  obj.key === 'baseCurrencyId' || 
                  obj.key === 'countryId' || 
                  obj.key === 'vatPct' || 
                  obj.key === 'timeZone' ||
                  obj.key === 'enableHijri' ||
                  obj.key === 'extentionsPath' || 
                  obj.key === 'backofficeEmail' ||
                  obj.key === 'dateFormat'
              );
          });
          filteredList.forEach(obj => {
              myObject[obj.key] = (
                  obj.key === 'baseCurrencyId' || 
                  obj.key === 'countryId' || 
                  obj.key === 'vatPct' || 
                  obj.key === 'timeZone' 
              ) ? (obj.value ? parseInt(obj.value) : null) : (
                  obj.key === 'enableHijri'
              ) ? (obj.value ? obj.value : false) :  (obj.value ? obj.value : null) ;
          });
      
          setInitialValues(myObject);
      })
      .catch(error => {
          setErrorMessage(error);
      });
    };

    const {
        labels: _labels,
        access
      } = useResourceQuery({
        datasetId: ResourceIds.SystemDefaults,
      })
    
    const formik = useFormik({
        enableReinitialize: true,
        validateOnChange: true,
        initialValues,
        validationSchema: yup.object({
          baseCurrencyId: yup.string().required(' '),
          vatPct: yup
            .number()
            .min(0, 'min')
            .max(100, 'max'),
        }),
        onSubmit: values => {
          postSystemDefaults(values)
        }
    })

    const postSystemDefaults = obj => {
      var data = []
      Object.entries(obj).forEach(([key, value]) => {
         const newObj = { key: key  , value : value };
         data.push(newObj);
   
      })
      postRequest({
          extension: SystemRepository.Defaults.set,
          record:   JSON.stringify({  sysDefaults  : data }),
      })

      .then(res => {
          if (res) toast.success('Record Successfully')
      })
      .catch(error => {
          setErrorMessage(error)
      })
  }
      
    return(
        <>
            <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                marginTop: '10px'
            }}
            >
                <Grid container spacing={5} sx={{pl:'10px'}} lg={3} md={7} sm={7} xs={12} >
                    <Grid item xs={12}>
                      <CustomTextField
                        name='extentionsPath'
                        label={_labels.extentionsPath}
                        value={formik.values.extentionsPath}
                        maxAccess={access}
                        maxLength='30'
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('extentionsPath', '')}
                        error={formik.touched.extentionsPath && Boolean(formik.errors.extentionsPath)}

                        // helperText={addressValidation.touched.extentionsPath && addressValidation.errors.extentionsPath}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={SystemRepository.Currency.qry}
                        name='baseCurrencyId'
                        label={_labels.baseCurrencyId}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ]}
                        required
                        values={formik.values}
                        readOnly={editMode}
                        valueField='recordId'
                        displayField='name'
                        maxAccess={access}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            formik.setFieldValue('baseCurrencyId', newValue?.recordId)
                          } else {
                            formik.setFieldValue('baseCurrencyId', '')
                          }
                        }}
                        error={formik.touched.baseCurrencyId && Boolean(formik.errors.baseCurrencyId)}

                        // helperText={formik.touched.baseCurrencyId && formik.errors.baseCurrencyId}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        endpointId={SystemRepository.Country.qry}
                        name='countryId'
                        label={_labels.countryId}
                        columnsInDropDown={[
                          { key: 'reference', value: 'Reference' },
                          { key: 'name', value: 'Name' }
                        ]}
                        values={formik.values}
                        valueField='recordId'
                        displayField='name'
                        maxAccess={access}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            formik.setFieldValue('countryId', newValue?.recordId)
                          } else {
                            formik.setFieldValue('countryId', '')
                          }
                        }}
                        error={formik.touched.countryId && Boolean(formik.errors.countryId)}

                        // helperText={formik.touched.countryId && formik.errors.countryId}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='vatPct'
                        label={_labels.vatPct}
                        value={formik.values.vatPct}
                        type='numeric'
                        numberField={true}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('vatPct', '')}
                        error={formik.touched.vatPct && Boolean(formik.errors.vatPct)}

                        // helperText={formik.touched.vatPct && formik.errors.vatPct}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        datasetId={DataSets.TimeZone}
                        name='timeZone'
                        label={_labels.timeZone}
                        valueField='key'
                        displayField='value'
                        values={formik.values}
                        maxAccess={access}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            formik.setFieldValue('timeZone', newValue?.recordId)
                          } else {
                            formik.setFieldValue('timeZone', '')
                          }
                        }}
                        error={formik.touched.timeZone && Boolean(formik.errors.timeZone)}

                        // helperText={formik.touched.timeZone && formik.errors.timeZone}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <ResourceComboBox
                        datasetId={DataSets.DateFormat}
                        name='dateFormat'
                        label={_labels.dateFormat}
                        valueField='key'
                        displayField='value'
                        values={formik.values}
                        maxAccess={access}
                        onChange={(event, newValue) => {
                           if (newValue) {
                                formik.setFieldValue('dateFormat', newValue?.key)
                              } else {
                                formik.setFieldValue('dateFormat', '')
                              }
                        }}
                        error={formik.touched.dateFormat && Boolean(formik.errors.dateFormat)}

                        // helperText={formik.touched.dateFormat && formik.errors.dateFormat}
                      />
                    </Grid>
                    <Grid item xs={12}>
                    <CustomTextField
                        name='backofficeEmail'
                        label={_labels.backofficeEmail}
                        value={formik.values.backofficeEmail}
                        onChange={formik.handleChange}
                        onClear={() => formik.setFieldValue('backofficeEmail', '')}
                        error={formik.touched.backofficeEmail && Boolean(formik.errors.backofficeEmail)}

                        // helperText={formik.touched.backofficeEmail && formik.errors.backofficeEmail}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name='enableHijri'
                            maxAccess={access}
                            checked={formik.values?.enableHijri}
                            onChange={(event) => {
                              formik.setFieldValue('enableHijri', event.target.checked);
                            }}
                          />
                        }
                        label={_labels.enableHijri}
                      />
                    </Grid>
                    <Grid sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        padding: 3,
                        textAlign: 'center',
                    }}>
                      <WindowToolbar 
                        onSave={formik.handleSubmit}
                        isSaved={true}
                      />
                    </Grid>
                </Grid>
                <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />

            </Box>
        </>
    )
  }
  
  export default SystemDefaults