// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports

import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { useFormik } from 'formik'
import { useContext} from 'react'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'

const ExchangeMapForm= ({
  maxAccess,
  editMode,
  currency,
  store,
  labels
}) => {

  const {recordId :currencyId , name:currencyName } = currency

  const {recordId, countries} = store
  const { postRequest, getRequest} = useContext(RequestsContext)

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({ plants: yup
      .array()
      .of(
        yup.object().shape({
          exchange: yup
            .object()
            .shape({
              recordId: yup.string().required('country recordId is required')
            })
            .required('exchange is required'),
        })
      ).required('Operations array is required') }),
    initialValues: {
      currencyId: currencyId ,
      countryId : '',
      plants: []
    },
    onSubmit: values => {
      postExchangeMaps(values)
    }
  })

const columns=[
  {
    component: 'textfield',
    label: labels?.plantName,
    name: 'plantName',
    props:{readOnly:true}
  },

  {
    component: 'textfield',
    label: labels?.name,
    name: 'plantRef',
    props:{readOnly:true}
  },

  {

    component: 'resourcecombobox',
    name: 'exchange',
    label: labels.exchangeTable,
    props: {
      endpointId: MultiCurrencyRepository.ExchangeTable.qry,
      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [{ from: 'name', to: 'exchangeName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
        { key: 'name', value: 'Name' },
      ],
      displayFieldWidth: 3
    },
    async onChange({ row: { update, newRow } }) {

      if(!newRow?.exchange?.recordId){
      return;
      }else{
           update({'exchangeName':newRow.exchange?.name,
                   'exchangeRef': newRow.exchange?.reference,
                   'exchangeId': newRow.exchange?.recordId })

      }



    }
  },
  {
    component: 'textfield',
    label: labels?.name,
    name: 'exchangeName',
    props:{readOnly:true}
  }

]

const getCurrenciesExchangeMaps = (corId, currencyId, countryId) => {

  formik.resetForm();
  const parameters = ''
  countryId && currencyId && getRequest({
    extension: SystemRepository.Plant.qry,
    parameters: parameters
  })
    .then(result => {
      const defaultParams = `_corId=${corId}&_currencyId=${currencyId}&_countryId=${countryId}`
      const parameters = defaultParams

      getRequest({
        extension: RemittanceSettingsRepository.CorrespondentExchangeMap.qry,
        parameters: parameters
      })
        .then(values => {
          const valuesMap = values.list.reduce((acc, fee) => {

            acc[fee.plantId] = fee

            return acc
          }, {})

          const plants = result.list.map((plant, index) => {
            const value = valuesMap[plant.recordId] || 0

            return {
              id : index,
              corId: corId,
              currencyId: currencyId,
              countryId: countryId,
              plantId: plant.recordId,
              plantName: plant.name,
              exchange :{
                recordId: value.exchangeId,
                reference: value.exchangeRef ? value.exchangeRef : '',
                name: value.exchangeName
              },
              exchangeName: value.exchangeName,

              // exchangeId: value.exchangeId,
              plantRef: plant.reference

            }
          })
          formik.setValues({  plants })
        })
        .catch(error => {
        })
    })
    .catch(error => {
    })

  //step 3: merge both
}

const postExchangeMaps = obj => {

  const data = {
    corId: recordId,
    countryId: formik.values.countryId,
    currencyId: currencyId,
    correspondentExchangeMaps: obj.plants
  }

  postRequest({
    extension: RemittanceSettingsRepository.CorrespondentExchangeMap.set2,
    record: JSON.stringify(data)
  })
    .then(res => {

      if (!res.recordId) toast.success('Record Added Successfully')
      else toast.success('Record Edited Successfully')
    })
    .catch(error => {
    })
}

return (
  <FormShell
    form={formik}
    resourceId={ResourceIds.Correspondent}
    maxAccess={maxAccess}
    editMode={editMode} >


<Grid container spacing={4} sx={{pt:2}}>
      <Grid item xs={6}  >
                <CustomTextField
                  name='currency'
                  label={labels.currency}
                  readOnly='true'
                  value={currencyName}
                  required
                  maxAccess={maxAccess}
                  sx={{m:1}}
                />
              </Grid>
              <Grid item xs={6}  sx={{mt:1}}>
                <CustomComboBox
                  name='countryId'
                  label={labels.country}
                  valueField='countryId'
                  displayField={['countryRef', 'countryName']}
                  columnsInDropDown= {[
                    { key: 'countryRef', value: 'Reference' },
                    { key: 'countryName', value: 'Name' },
                  ]}
                  store={countries}
                  value={countries.filter(item => item.countryId === formik.values.countryId)[0]} // Ensure the value matches an option or set it to null
                  required
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('countryId', newValue?.countryId)
                    const selectedCountryId = newValue?.countryId || ''

                    getCurrenciesExchangeMaps(
                      recordId,
                      currencyId,
                      selectedCountryId
                    ) // Fetch and update state data based on the selected country
                  }}

                  error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                  helperText={formik.touched.countryId && formik.errors.countryId}
                />
              </Grid>

            <Grid item xs={12} >
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <DataGrid
                    onChange={value => formik.setFieldValue('plants', value)}
                    value={formik.values.plants}
                    error={formik.errors.plants}
                    columns={columns}
                    allowDelete={false}
                    allowAddNewLine={false}
                  />

              </Box>
            </Grid>
          </Grid>

    </FormShell>
  )
}

export default ExchangeMapForm
