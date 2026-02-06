import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import * as yup from 'yup'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RemittanceBankInterface } from '@argus/repositories/src/repositories/RemittanceBankInterface'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const CorrespondentDispersalRate = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.CorrespondentDispersalRate
  })

  const { formik } = useForm({
    initialValues: {
      corId: null,
      currencyId: null,
      plantId: 0,
      countryId: null,
      dispersalType: null,
      items: []
    },
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.number().required(),
      corId: yup.number().required(),
      currencyId: yup.number().required(),
      dispersalType: yup.number().required(),
      items: yup
        .array()
        .of(
          yup.object().shape({
            minRate: yup
              .number()
              .nullable()
              .transform(value => (value === '' ? null : value))
              .test('min-required-if-any', 'minRate is required', function (minRate) {
                const { maxRate, rate } = this.parent
                const anyFilled = maxRate != null || rate != null
                if (anyFilled && minRate == null) {
                  return false
                }

                return true
              }),
            maxRate: yup
              .number()
              .nullable()
              .transform(value => (value === '' ? null : value))
              .test('max-required-if-any', 'maxRate is required', function (maxRate) {
                const { minRate, rate } = this.parent
                const anyFilled = minRate != null || rate != null
                if (anyFilled && maxRate == null) {
                  return false
                }

                return true
              }),

            rate: yup
              .number()
              .nullable()
              .transform(value => (value === '' ? null : value))
              .test('rate-required-if-any', 'rate is required', function (rate) {
                const { minRate, maxRate } = this.parent
                const anyFilled = minRate != null || maxRate != null
                if (anyFilled && rate == null) {
                  return false
                }

                return true
              })
              .test('rate-between', 'rate must be between minRate and maxRate', function (rate) {
                const { minRate, maxRate } = this.parent
                if (rate != null && minRate != null && maxRate != null && !(minRate <= rate && rate <= maxRate)) {
                  return false
                }

                return true
              })
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const filteredItems = obj?.items?.filter(
        item => item.rate != null || item.minRate != null || item.maxRate != null
      )

      const payload = {
        ...obj,
        items: filteredItems
      }

      await postRequest({
        extension: RemittanceSettingsRepository.CorrespondentDispersalRate.set2,
        record: JSON.stringify(payload)
      })

      toast.success(platformLabels.Updated)
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels.plant,
      name: 'plantName',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.defaultRate,
      name: 'defaultRate',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.rcm,
      name: 'rateCalcMethodName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.min,
      name: 'minRate',
      props: {
        maxLength: 15,
        decimalScale: 7
      }
    },
    {
      component: 'numberfield',
      label: labels.rate,
      name: 'rate',
      props: {
        maxLength: 15,
        decimalScale: 7
      }
    },
    {
      component: 'numberfield',
      label: labels.max,
      name: 'maxRate',
      props: {
        maxLength: 15,
        decimalScale: 7
      }
    }
  ]

  const fetchPlants = async plantId => {
    let plantRes = []
    if (plantId) {
      plantRes = await getRequest({ extension: SystemRepository.Plant.get, parameters: `_recordId=${plantId}` })
    } else {
      plantRes = await getRequest({ extension: SystemRepository.Plant.qry })
    }

    return plantRes
  }

  const fetchData = async (corId, countryId, currencyId, plantId, dispersalType) => {
    return await getRequest({
      extension: RemittanceSettingsRepository.CorrespondentDispersalRate.qry,
      parameters: `_corId=${corId}&_countryId=${countryId || 0}&_currencyId=${currencyId || 0}&_plantId=${
        plantId || 0
      }&_dispersalType=${dispersalType || 0}`
    })
  }

  const fetchATPExchangeRate = async currencyId => {
    return await getRequest({
      extension: RemittanceBankInterface.ATPExchangeRate.get2,
      parameters: `_toCurrencyId=${currencyId || 0}`
    })
  }

  const onPreview = async () => {
    const { plantId, corId, countryId, currencyId, dispersalType } = formik.values

    const resData = (await fetchData(corId, countryId, currencyId, plantId, dispersalType))?.list || []
    const { fxRate, rateCalcMethodName, rateCalcMethod } = (await fetchATPExchangeRate(currencyId))?.record || []

    const plants = await fetchPlants(plantId)

    const filteredPlants = plantId ? [plants.record] : plants?.list

    const items = filteredPlants?.map((plant, index) => {
      const existingItem = resData.find(item => item.plantId === plant.recordId)

      return {
        id: index + 1,
        corId: formik.values.corId,
        plantId: plant.recordId,
        plantName: plant.name,
        minRate: existingItem?.minRate || null,
        rate: existingItem?.rate || null,
        maxRate: existingItem?.maxRate || null,
        currencyId: formik.values.currencyId,
        rateCalcMethod: rateCalcMethod,
        defaultRate: fxRate,
        rateCalcMethodName: rateCalcMethodName
      }
    })

    formik.setFieldValue('items', items)
  }

  const copyRowValues = formik => {
    const firstRow = formik.values.items[0]

    const rows = formik.values.items.map(row => {
      return {
        ...row,
        minRate: firstRow.minRate,
        maxRate: firstRow.maxRate,
        rate: firstRow.rate
      }
    })

    formik.setValues({
      ...formik.values,
      items: rows
    })
  }

  useEffect(() => {
    if (formik.values.corId && formik.values.currencyId && formik.values.countryId && formik.values.dispersalType) {
      onPreview()
    } else {
      formik.setFieldValue('items', [])
    }
  }, [
    formik.values.corId,
    formik.values.countryId,
    formik.values.currencyId,
    formik.values.plantId,
    formik.values.dispersalType
  ])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} fullSize>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2} p={2}>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={RemittanceSettingsRepository.Correspondent.qry2}
                name='corId'
                label={labels.corName}
                valueField='recordId'
                displayField={'name'}
                required
                values={formik.values}
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('corId', newValue?.recordId || null)
                  formik.setFieldValue('interfaceId', newValue?.interfaceId || '')
                  formik.setFieldValue('corName', newValue?.name || '')
                  formik.setFieldValue('corRef', newValue?.reference || '')
                  if (!newValue) {
                    formik.setFieldValue('currencyId', null)
                    formik.setFieldValue('currencyName', '')
                    formik.setFieldValue('countryId', null)
                    formik.setFieldValue('countryName', '')
                  }
                }}
                error={formik.touched.corId && Boolean(formik.errors.corId)}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={RemittanceBankInterface.Countries.qry}
                parameters={`_interfaceId=${formik.values.interfaceId || 2}`}
                name='countryId'
                label={labels.country}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                values={formik.values}
                displayFieldWidth={1.75}
                onChange={(event, newValue) => {
                  formik.setFieldValue('countryId', newValue?.recordId || null)
                  formik.setFieldValue('countryName', newValue?.name || '')
                  if (!newValue) {
                    formik.setFieldValue('currencyId', null)
                    formik.setFieldValue('currencyName', '')
                  }
                }}
                readOnly={!formik.values.corId}
                error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={RemittanceBankInterface.Currencies.qry}
                parameters={`_interfaceId=${formik.values.interfaceId || 2}&_countryId=${formik.values.countryId || 0}`}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                values={formik.values}
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                  formik.setFieldValue('currencyName', newValue?.name || '')
                }}
                readOnly={!formik.values.corId || !formik.values.countryId}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>

            <Grid item xs={2}>
              <ResourceComboBox
                values={formik.values}
                datasetId={DataSets.RT_Dispersal_Type}
                name='dispersalType'
                label={labels.dispersalType}
                valueField='key'
                displayField='value'
                maxAccess={access}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('dispersalType', newValue?.key || null)
                }}
                error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
              />
            </Grid>
            <Grid item xs={2}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'plant Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || 0)
                  formik.setFieldValue('plantName', newValue?.name || '')
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={1}>
              <CustomButton
                onClick={() => copyRowValues(formik)}
                variant='contained'
                color='#231f20'
                label={platformLabels.Copy}
                disabled={
                  !formik?.values?.items ||
                  !formik?.values?.items[0]?.rate ||
                  !formik?.values?.items[0]?.minRate ||
                  !formik?.values?.items[0]?.maxRate
                }
              />
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
            name='items'
            maxAccess={access}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default CorrespondentDispersalRate
