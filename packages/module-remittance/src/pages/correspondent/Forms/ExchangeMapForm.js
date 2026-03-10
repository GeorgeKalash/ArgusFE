import { Grid, Box } from '@mui/material'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { useFormik } from 'formik'
import { useContext } from 'react'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const ExchangeMapForm = ({ maxAccess, editMode, currency, store, labels }) => {
  const { currencyId, currencyName } = currency
  const { recordId } = store
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
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
    onSubmit: async values => {
      await postExchangeMaps(values)
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
      }).then(result => {
        const defaultParams = `_corId=${corId}&_currencyId=${currencyId}&_countryId=${countryId}`
        const parameters = defaultParams
        getRequest({
          extension: RemittanceSettingsRepository.CorrespondentExchangeMap.qry,
          parameters: parameters
        }).then(values => {
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
      })
  }

  const postExchangeMaps = async obj => {
    const data = {
      corId: recordId,
      countryId: formik.values.countryId,
      currencyId: currencyId,
      correspondentExchangeMaps: obj.plants
    }
    await postRequest({
      extension: RemittanceSettingsRepository.CorrespondentExchangeMap.set2,
      record: JSON.stringify(data)
    }).then(res => {
      if (!res.recordId) toast.success(platformLabels.Added)
      else toast.success(platformLabels.Edited)
    })
  }

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Correspondent}
      isInfo={false}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container spacing={2} sx={{ pt: 2 }}>
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
