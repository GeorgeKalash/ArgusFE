// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports

import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import FormShell from 'src/components/Shared/FormShell'
import { useFormik } from 'formik'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useEffect, useState } from 'react'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

const ExchangeMapWindow = ({
  recordId,
  maxAccess,
  editMode,
  store,
  labels
}) => {

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    countries : store.countries,
    validate: values => {
      const isValid = values.rows.every(row => !!row.plantId)
      const isValidExchangeId = values.rows.every(row => !!row.exchangeId)

      return isValid && isValidExchangeId
        ? {}
        : { rows: Array(values.rows.length).fill({ plantId: 'Plant is required' }) }
    },
    initialValues: {
      currencyId: '' , countryId : '',
      rows: [
        {
          corId: recordId,
          currencyId: '',
          countryId: '',
          plantId: '',
          plantRef: '',
          exchangeId: '',
          exchangeRef: '',
          exchangeName: ''
        }
      ]
    },
    onSubmit: values => {
      // console.log(values + 'value')
      postExchangeMaps(values)
    }
  })

const columns=[
  {
    component: 'textfield',
    label: labels?.plantName,
    name: 'plantName',
  },

  {
    component: 'textfield',
    label: labels?.plantRef,
    name: 'plantRef',
  },

  {

    component: 'resourcecombobox',
    name: 'country',
    label: labels.country,
    props: {
      endpointId: SystemRepository.Country.qry,
      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [{ from: 'name', to: 'countryName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
        { key: 'name', value: 'Name' },
      ]
    }
  },
  {
    component: 'textfield',
    label: labels?.name,
    name: 'countryName',
  }

]



return (
  <FormShell
    form={formik}
    resourceId={ResourceIds.Correspondent}
    maxAccess={maxAccess}
    editMode={editMode} >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',

          }}
        >
          <Grid container gap={2}>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={6}>
                <ResourceComboBox
                  name='currencyId'
                  label={labels.currency}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  readOnly='true'
                  values={formik.values}
                  required
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('currencyId', newValue?.recordId)
                  }}
                  error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  helperText={formik.touched.currencyId && formik.errors.currencyId}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomComboBox
                  name='countryId'
                  label={labels.country}
                  valueField='countryId'
                  displayField={['countryRef', 'countryName']}
                  columnsInDropDown= {[
                    { key: 'countryRef', value: 'Reference' },
                    { key: 'countryName', value: 'Name' },
                  ]}
                  store={store.countries}
                  value={store.countries.filter(item => item.countryId === formik.values.countryId)[0]} // Ensure the value matches an option or set it to null
                  required
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('countryId', newValue?.countryId)
                    const selectedCountryId = newValue?.countryId || ''

                    // getCurrenciesExchangeMaps(
                    //   formik.values.corId,
                    //   formik.values.currencyId,
                    //   selectedCountryId
                    // ) // Fetch and update state data based on the selected country
                  }}

                  error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                  helperText={formik.touched.countryId && formik.errors.countryId}
                />
              </Grid>
            </Grid>
            <Grid xs={12}>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                {formik.values.countryId && (
                  <gridData
                  onChange={value => formik.setFieldValue('countries', value)}
                  value={formik.values.countries}
                  error={formik.errors.countries}
                  columns={columns}
                    allowDelete={false}
                    allowAddNewLine={false}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

    </FormShell>
  )
}

export default ExchangeMapWindow
