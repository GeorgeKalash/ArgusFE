import { Grid } from '@mui/material'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DataSets } from 'src/resources/DataSets'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomButton from 'src/components/Inputs/CustomButton'
import { RemittanceBankInterface } from 'src/repositories/RemittanceBankInterface'
import { CommonContext } from 'src/providers/CommonContext'

const CorrespondentDispersalForm = ({ recordId, labels, maxAccess, interfaceId }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  const initialValues = {
    corId: recordId,
    countryId: 0,
    currencyId: 0,
    plantId: 0,
    items: []
  }

  const { formik } = useForm({
    initialValues,
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async obj => {
      const filteredObj = {
        ...obj,
        items: obj.items?.filter(item => item.corDeliveryMode).map(({ id, items, ...rest }) => rest) || []
      }

      await postRequest({
        extension: RemittanceSettingsRepository.CorDispControl.set2,
        record: JSON.stringify(filteredObj)
      })

      toast.success(platformLabels.Updated)
    }
  })

  async function getDispersalMode() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.RT_Dispersal_Type,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  const fetchPlants = async (plantId, plantName) => {
    if (plantId) return [{ recordId: plantId, name: plantName }]
    const plantRes = await getRequest({ extension: SystemRepository.Plant.qry })

    return plantRes?.list || []
  }

  const fetchCountries = async (countryId, countryName) => {
    if (countryId) return [{ recordId: countryId, name: countryName }]

    const countryRes = await getRequest({
      extension: RemittanceBankInterface.Countries.qry,
      parameters: `_interfaceId=${interfaceId || 0}`
    })

    return countryRes?.list?.filter(country => country.recordId) || []
  }

  const fetchCurrencies = async countryId => {
    const currencyRes = await getRequest({
      extension: RemittanceBankInterface.Currencies.qry,
      parameters: `_interfaceId=${interfaceId || 0}${countryId ? `&_countryId=${countryId}` : ''}`
    })

    return currencyRes?.list?.filter(currency => currency.recordId) || []
  }

  const fetchData = async (countryId, currencyId, plantId) => {
    return await getRequest({
      extension: RemittanceSettingsRepository.CorDispControl.qry,
      parameters: `_corId=${recordId}&_countryId=${countryId || 0}&_currencyId=${currencyId || 0}&_plantId=${
        plantId || 0
      }`
    })
  }

  const onPreview = async () => {
    const { plantId, countryId, currencyId, plantName, countryName } = formik.values
    const dispersalModes = await getDispersalMode()

    const resData = (await fetchData(countryId, currencyId, plantId))?.list || []

    if (plantId && countryId && currencyId) {
      formik.setFieldValue(
        'items',
        dispersalModes.map((mode, index) => {
          const existingItem = resData.find(item => parseInt(item.dispersalType) == mode.key)

          return {
            id: index + 1,
            dispersalTypeName: mode.value,
            dispersalType: mode.key,
            corDeliveryModeName: existingItem?.deliveryModeDescription,
            corDeliveryMode: existingItem?.deliveryMode,
            ...formik.values,
            ...existingItem
          }
        })
      )

      return
    }

    if (currencyId && !plantId && !countryId) {
      const plants = await fetchPlants(plantId, plantName)
      const countries = await fetchCountries(countryId, countryName)
      if (!plants.length || !countries.length) return

      formik.setFieldValue('items', [
        ...new Map(
          plants
            .flatMap(plant =>
              countries.flatMap(country =>
                dispersalModes.map(mode => {
                  const existingItem = resData.find(
                    item =>
                      parseInt(item.dispersalType) == mode.key &&
                      item.plantId == plant.recordId &&
                      item.countryId == country.recordId
                  )

                  return {
                    id: `${plant.recordId}-${country.recordId}-${mode.key}`,
                    ...formik.values,
                    plantId: plant.recordId,
                    plantName: plant.name,
                    countryId: country.recordId,
                    countryName: country.name,
                    currencyId,
                    dispersalTypeName: mode.value,
                    dispersalType: mode.key,
                    corDeliveryModeName: existingItem?.deliveryModeDescription || null,
                    corDeliveryMode: existingItem?.deliveryMode || null,
                    ...existingItem
                  }
                })
              )
            )
            .map(i => [i.id, i])
        ).values()
      ])

      return
    }

    if (countryId && !plantId && !currencyId) {
      const plants = await fetchPlants(plantId, plantName)
      if (!plants.length) return
      const currencies = await fetchCurrencies(countryId)
      if (!currencies.length) return

      formik.setFieldValue(
        'items',
        plants.flatMap(plant =>
          currencies.flatMap(currency =>
            dispersalModes.map(mode => {
              const existingItem = resData.find(
                item =>
                  parseInt(item.dispersalType) == mode.key &&
                  item.plantId == plant.recordId &&
                  item.currencyId == currency.recordId
              )

              return {
                id: `${plant.recordId}-${currency.recordId}-${mode.key}`,
                ...formik.values,
                plantId: plant.recordId,
                plantName: plant.name,
                currencyId: currency.recordId,
                currencyName: currency.name,
                dispersalTypeName: mode.value,
                dispersalType: mode.key,
                corDeliveryModeName: existingItem?.deliveryModeDescription || null,
                corDeliveryMode: existingItem?.deliveryMode || null,
                ...existingItem
              }
            })
          )
        )
      )

      return
    }

    if (plantId && !countryId && !currencyId) {
      const countries = await fetchCountries(countryId, countryName)
      if (!countries.length) return

      const currencies = (
        await Promise.all(
          countries.map(async country => {
            return (
              (await fetchCurrencies(country.recordId)).map(currency => ({
                ...currency,
                countryId: country.recordId
              })) || []
            )
          })
        )
      ).flat()

      if (!currencies.length) return

      formik.setFieldValue(
        'items',
        countries.flatMap(country =>
          currencies
            .filter(currency => currency.countryId === country.recordId)
            .flatMap(currency =>
              dispersalModes
                .map(mode => {
                  if (!country.recordId || !currency.recordId) return null

                  const existingItem = resData.find(
                    item =>
                      parseInt(item.dispersalType) == mode.key &&
                      item.countryId == country.recordId &&
                      item.currencyId == currency.recordId
                  )

                  return {
                    id: `${plantId}-${country.recordId}-${currency.recordId}-${mode.key}`,
                    ...formik.values,
                    plantId,
                    plantName,
                    countryId: country.recordId,
                    countryName: country.name,
                    currencyId: currency.recordId,
                    currencyName: currency.name,
                    dispersalTypeName: mode.value,
                    dispersalType: mode.key,
                    corDeliveryModeName: existingItem?.deliveryModeDescription || null,
                    corDeliveryMode: existingItem?.deliveryMode || null,
                    ...existingItem
                  }
                })
                .filter(Boolean)
            )
        )
      )

      return
    }

    if (plantId && countryId && !currencyId) {
      const currencyRes = await getRequest({
        extension: RemittanceBankInterface.Currencies.qry,
        parameters: `_interfaceId=${interfaceId || 0}&_countryId=${countryId}`
      })

      const currencies = currencyRes?.list || []
      if (!currencies.length) return

      formik.setFieldValue(
        'items',
        currencies.flatMap(currency =>
          dispersalModes.map(mode => {
            const existingItem = resData.find(
              item =>
                parseInt(item.dispersalType) == mode.key &&
                item.plantId == plantId &&
                item.countryId == countryId &&
                item.currencyId == currency.recordId
            )

            return {
              id: `${plantId}-${countryId}-${currency.recordId}-${mode.key}`,
              ...formik.values,
              plantId,
              plantName,
              countryId,
              countryName,
              currencyId: currency.recordId,
              currencyName: currency.name,
              dispersalTypeName: mode.value,
              dispersalType: mode.key,
              corDeliveryModeName: existingItem?.deliveryModeDescription || null,
              corDeliveryMode: existingItem?.deliveryMode || null,
              ...existingItem
            }
          })
        )
      )
    }

    if (plantId && !countryId && currencyId) {
      const countries = (await fetchCountries(countryId, countryName)).filter(country => country.recordId)
      if (!countries.length) return

      formik.setFieldValue(
        'items',
        countries.flatMap(country =>
          dispersalModes.map(mode => {
            const existingItem = resData.find(
              item =>
                parseInt(item.dispersalType) == mode.key &&
                item.plantId == plantId &&
                item.currencyId == currencyId &&
                item.countryId == country.recordId
            )

            return {
              id: `${plantId}-${country.recordId}-${currencyId}-${mode.key}`,
              ...formik.values,
              plantId,
              plantName,
              countryId: country.recordId,
              countryName: country.name,
              currencyId,
              dispersalTypeName: mode.value,
              dispersalType: mode.key,
              corDeliveryModeName: existingItem?.deliveryModeDescription || null,
              corDeliveryMode: existingItem?.deliveryMode || null,
              ...existingItem
            }
          })
        )
      )
    }

    if (!plantId && countryId && currencyId) {
      const plants = await fetchPlants(plantId, plantName)
      if (!plants.length) return

      formik.setFieldValue(
        'items',
        plants.flatMap(plant =>
          dispersalModes.map(mode => {
            const existingItem = resData.find(
              item => parseInt(item.dispersalType) == mode.key && item.plantId == plant.recordId
            )

            return {
              id: `${plant.recordId}-${mode.key}`,
              ...formik.values,
              plantId: plant.recordId,
              plantName: plant.name,
              dispersalTypeName: mode.value,
              dispersalType: mode.key,
              corDeliveryModeName: existingItem?.deliveryModeDescription || null,
              corDeliveryMode: existingItem?.deliveryMode || null,
              ...existingItem
            }
          })
        )
      )

      return
    }

    if (!plantId && !countryId && !currencyId) {
      const plants = await fetchPlants(plantId, plantName)
      const countries = await fetchCountries(countryId, countryName)

      if (!plants.length || !countries.length) return

      const currenciesMap = {}
      for (const country of countries) {
        currenciesMap[country.recordId] = await fetchCurrencies(country.recordId)
      }

      formik.setFieldValue(
        'items',
        plants.flatMap(plant =>
          countries.flatMap(country =>
            (currenciesMap[country.recordId] || []).flatMap(currency =>
              dispersalModes.map(mode => {
                const existingItem = resData.find(
                  item =>
                    parseInt(item.dispersalType) == mode.key &&
                    item.plantId == plant.recordId &&
                    item.countryId == country.recordId &&
                    item.currencyId == currency.recordId
                )

                return {
                  id: `${plant.recordId}-${country.recordId}-${currency.recordId}-${mode.key}`,
                  ...formik.values,
                  plantId: plant.recordId,
                  plantName: plant.name,
                  countryId: country.recordId,
                  countryName: country.name,
                  currencyId: currency.recordId,
                  currencyName: currency.name,
                  dispersalTypeName: mode.value,
                  dispersalType: mode.key,
                  corDeliveryModeName: existingItem?.deliveryModeDescription || null,
                  corDeliveryMode: existingItem?.deliveryMode || null,
                  ...existingItem
                }
              })
            )
          )
        )
      )
    }
  }

  const columns = [
    {
      component: 'checkbox',
      label: labels.isActive,
      name: 'isActive'
    },
    {
      component: 'textfield',
      name: 'plantName',
      label: labels.branch,
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.corDeliveryModeName,
      name: 'corDeliveryModeName',
      variableParameters: [
        { key: 'countryId', value: 'countryId' },
        { key: 'currencyId', value: 'currencyId' },
        { key: 'dispersalMode', value: 'dispersalType' }
      ],
      props: {
        endpointId: RemittanceBankInterface.DeliveryMode.qry,
        parameters: `_interfaceId=${interfaceId}&_corId=${recordId}`,
        displayField: 'deliveryModeDescription',
        valueField: 'deliveryMode',
        mapping: [
          { from: 'deliveryModeDescription', to: 'corDeliveryModeName' },
          { from: 'deliveryMode', to: 'corDeliveryMode' }
        ]
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.dispersalType,
      name: 'dispersalTypeName',
      props: {
        datasetId: DataSets.RT_Dispersal_Type,
        displayField: 'value',
        valueField: 'key',
        mapping: [
          { from: 'key', to: 'dispersalType' },
          { from: 'value', to: 'dispersalTypeName' }
        ],
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'currencyName',
      label: labels.currency,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'countryName',
      label: labels.country,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'corName',
      label: labels.corName,
      props: {
        readOnly: true
      }
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} padding={2}>
          <Grid item xs={2}>
            <ResourceComboBox
              endpointId={RemittanceBankInterface.Countries.qry}
              parameters={`_interfaceId=${interfaceId || 0}`}
              name='countryId'
              label={labels.country}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              displayFieldWidth={1.75}
              onChange={(event, newValue) => {
                formik.setFieldValue('countryId', newValue?.recordId || 0)
                formik.setFieldValue('countryName', newValue?.name || 0)
              }}
              error={formik.touched.countryId && Boolean(formik.errors.countryId)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={2}>
            <ResourceComboBox
              endpointId={RemittanceBankInterface.Currencies.qry}
              parameters={`_interfaceId=${interfaceId || 0}&_countryId=${formik.values.countryId || 0}`}
              name='currencyId'
              label={labels.currency}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('currencyId', newValue?.recordId || 0)
                formik.setFieldValue('currencyName', newValue?.name || null)
              }}
              error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
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
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('plantId', newValue?.recordId || 0)
                formik.setFieldValue('plantName', newValue?.name || 0)
              }}
              error={formik.touched.plantId && Boolean(formik.errors.plantId)}
            />
          </Grid>
          <Grid item xs={2}>
            <CustomButton onClick={onPreview} label={platformLabels.Preview} color='#231f20' />
          </Grid>
        </Grid>
      </Fixed>

      <Grow>
        <DataGrid
          onChange={value => formik.setFieldValue('items', value)}
          value={formik.values.items}
          error={formik.errors.items}
          allowDelete={false}
          allowAddNewLine={false}
          columns={columns}
        />
      </Grow>
      <Fixed>
        <WindowToolbar onSave={formik.handleSubmit} isSaved={true} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

export default CorrespondentDispersalForm
