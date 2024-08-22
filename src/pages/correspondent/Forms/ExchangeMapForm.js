import { Grid, Box } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ControlContext } from 'src/providers/ControlContext'

const ExchangeMapForm = ({ maxAccess, editMode, currency, store, expanded, height, labels }) => {
  const { currencyId, currencyName } = currency
  const { recordId, countries } = store
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      plants: yup
        .array()
        .of(
          yup.object().shape({
            exchangeId: yup.string().required('country recordId is required')
          })
        )
        .required('plants array is required')
    }),
    initialValues: {
      currencyId: currencyId,
      countryId: '',
      plants: []
    },
    onSubmit: values => {
      postExchangeMaps(values)
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels?.plant,
      name: 'plantRef',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels?.name,
      name: 'plantName',
      props: { readOnly: true }
    },
    {
      component: 'resourcecombobox',
      name: 'exchangeId',
      label: labels.exchangeTable,
      props: {
        endpointId: MultiCurrencyRepository.ExchangeTable.qry,
        valueField: 'recordId',
        displayField: 'reference',
        mapping: [
          { from: 'recordId', to: 'exchangeId' },
          { from: 'reference', to: 'exchangeRef' },
          { from: 'name', to: 'exchangeName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 3
      }
    },
    {
      component: 'textfield',
      label: labels?.name,
      name: 'exchangeName',
      props: { readOnly: true },
      flex: 1.5
    }
  ]

  const getCurrenciesExchangeMaps = (corId, currencyId, countryId) => {
    formik.setFieldValue('plants', [])
    const parameters = ''
    countryId &&
      currencyId &&
      getRequest({
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
                const value = valuesMap[plant?.recordId] || 0

                return {
                  id: index,
                  corId: corId,
                  currencyId: currencyId,
                  countryId: countryId,
                  plantId: plant.recordId,
                  plantName: plant.name,
                  plantRef: plant.reference,
                  exchangeName: value?.exchangeName,
                  exchangeRef: value.exchangeRef ? value.exchangeRef : '',
                  exchangeId: value?.exchangeId
                }
              })
              formik.setFieldValue('plants', plants)
            })
            .catch(error => {})
        })
        .catch(error => {})

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
        if (!res.recordId) toast.success(platformLabels.Added)
        else toast.success(platformLabels.Edited)
      })
      .catch(error => {})
  }

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Correspondent}
      infoVisible={false}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container spacing={4} sx={{ pt: 2 }}>
        <Grid item xs={6}>
          <CustomTextField
            name='currency'
            label={labels.currency}
            readOnly='true'
            value={currencyName}
            required
            maxAccess={maxAccess}
            sx={{ m: 1 }}
          />
        </Grid>
        <Grid item xs={6} sx={{ mt: 1 }}>
          <ResourceComboBox
            endpointId={RemittanceSettingsRepository.CorrespondentCountry.qry}
            parameters={`_corId=${recordId}`}
            name='countryId'
            label={labels.country}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            valueField='recordId'
            displayField={['countryRef', 'countryName']}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('countryId', newValue?.countryId)
              const selectedCountryId = newValue?.countryId || ''
              getCurrenciesExchangeMaps(recordId, currencyId, selectedCountryId)
            }}
            error={formik.touched.countryId && Boolean(formik.errors.countryId)}
            helperText={formik.touched.countryId && formik.errors.countryId}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            {formik?.values?.plants[0]?.plantName && (
              <DataGrid
                onChange={value => formik.setFieldValue('plants', value)}
                value={formik.values.plants}
                error={formik.errors.plants}
                columns={columns}
                allowDelete={false}
                allowAddNewLine={false}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default ExchangeMapForm
