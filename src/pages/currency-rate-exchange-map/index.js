import { useEffect, useState, useContext } from 'react'
import { Grid, Box } from '@mui/material'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import toast from 'react-hot-toast'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { useResourceQuery } from 'src/hooks/resource'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

const CurrencyRateExchangeMap = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  //state
  const [exchangeTableStore, setExchangeTableStore] = useState([])
  const [errorMessage, setErrorMessage] = useState()

  const { labels: labels, access } = useResourceQuery({
    datasetId: ResourceIds.CurrencyRateExchangeMap
  })

  const fillExchangeTableStore = id => {
    setExchangeTableStore({})

    var parameters = `_currencyId=` + id
    getRequest({
      extension: MultiCurrencyRepository.ExchangeTable.qry2,
      parameters: parameters
    })
      .then(res => {
        setExchangeTableStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const [initialValues, setInitialData] = useState({
    currencyId: '',
    rateTypeId: ''
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      currencyId: yup.string().required(),
      rateTypeId: yup.string().required()
    }),
    onSubmit: values => {}
  })

  useEffect(() => {
    if (formik.values && formik.values.currencyId > 0) {
      fillExchangeTableStore(formik.values.currencyId)
    }
  }, [formik.values.currencyId])
  useEffect(() => {
    if (formik.values && formik.values.currencyId > 0 && formik.values.rateTypeId > 0) {
      getCurrenciesExchangeMaps(formik.values.currencyId, formik.values.rateTypeId)
    }
  }, [formik.values])

  const exchangeMapsGridValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {
      const isValid = values.rows && values.rows.every(row => !!row.plantId)
      const isValidExchangeId = values.rows && values.rows.every(row => !!row.exchangeId)

      return isValid // prevent Submit if not validate
        ? isValidExchangeId
          ? {}
          : { rows: Array(values.rows && values.rows.length).fill({ plantId: 'Exchange is required' }) }
        : { rows: Array(values.rows && values.rows.length).fill({ countryId: 'plant is required' }) }
    },
    initialValues: {
      rows: [
        {
          currencyId: formik.values.currencyId,
          rateTypeId: formik.values.rateTypeId,
          plantId: '',
          plantName: '',
          exchangeRef: '',
          exchangeId: '',
          exchangeName: ''
        }
      ]
    },
    onSubmit: async values => {
      await postExchangeMaps(values)
    }
  })

  const postExchangeMaps = async obj => {
    const data = {
      currencyId: formik.values.currencyId,
      rateTypeId: formik.values.rateTypeId,
      exchangeMaps: obj.rows
    }
    await postRequest({
      extension: CurrencyTradingSettingsRepository.ExchangeMap.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Saved Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getCurrenciesExchangeMaps = (currencyId, rateTypeId) => {
    exchangeMapsGridValidation.setValues({ rows: [] })
    const parameters = ''

    getRequest({
      extension: SystemRepository.Plant.qry,
      parameters: parameters
    })
      .then(plants => {
        const defaultParams = `_currencyId=${currencyId}&_rateTypeId=${rateTypeId}`
        var parameters = defaultParams
        getRequest({
          extension: CurrencyTradingSettingsRepository.ExchangeMap.qry,
          parameters: parameters
        }).then(values => {
          // Create a mapping of commissionId to values entry for efficient lookup
          const valuesMap = values.list.reduce((acc, fee) => {
            acc[fee.plantId] = fee

            return acc
          }, {})

          // Combine exchangeTable and values
          const rows = plants.list.map(plant => {
            const value = valuesMap[plant.recordId] || 0

            return {
              currencyId: currencyId,
              rateTypeId: rateTypeId,
              plantId: plant.recordId,
              plantName: plant.name,
              exchangeId: value?.exchange?.recordId ? value.exchange.recordId : '',
              plantRef: plant.reference,
              exchangeRef: value?.exchange?.reference ? value.exchange.reference : '',
              exchangeName: value?.exchange?.name ? value.exchange.name : ''
            }
          })

          exchangeMapsGridValidation.setValues({ rows })
        })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  //columns
  const exchangeMapsInlineGridColumns = [
    {
      field: 'textfield',
      header: labels.plantRef, //label
      name: 'plantRef',
      mandatory: true,
      readOnly: true
    },
    {
      field: 'textfield',
      header: labels.plantName, //label
      name: 'plantName',
      mandatory: true,
      readOnly: true
    },
    {
      field: 'combobox',
      header: labels.exchangeRef,
      nameId: 'exchangeId',
      name: 'exchangeRef',
      mandatory: true,
      store: exchangeTableStore.list,
      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [{ from: 'name', to: 'exchangeName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
        { key: 'name', value: 'Name' }
      ]
    },
    {
      field: 'textfield',
      header: labels.exchangeName,
      name: 'exchangeName',
      mandatory: false,
      readOnly: true
    }
  ]

  const handleSubmit = () => {
    exchangeMapsGridValidation.handleSubmit()
  }

  return (
    <VertLayout>
      <CustomTabPanel index={0} value={0}>
        <Grow>
          <Grid container>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={6}>
                <ResourceComboBox
                  endpointId={SystemRepository.Currency.qry}
                  name='currencyId'
                  label={labels.currency}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Currency Ref' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  required
                  maxAccess={access}
                  onChange={(event, newValue) => {
                    formik && formik.setFieldValue('currencyId', newValue?.recordId)
                  }}
                  error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  helperText={formik.touched.currencyId && formik.errors.currencyId}
                />
              </Grid>
              <Grid item xs={6}>
                <ResourceComboBox
                  endpointId={MultiCurrencyRepository.RateType.qry}
                  name='rateTypeId'
                  label={labels.rateType}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Ref' },
                    { key: 'name', value: 'Name' }
                  ]}
                  values={formik.values}
                  required
                  maxAccess={access}
                  onChange={(event, newValue) => {
                    formik && formik.setFieldValue('rateTypeId', newValue?.recordId)
                  }}
                  error={formik.touched.rateTypeId && Boolean(formik.errors.rateTypeId)}
                  helperText={formik.touched.rateTypeId && formik.errors.rateTypeId}
                />
              </Grid>
            </Grid>
            {formik.values.currencyId > 0 && formik.values.rateTypeId > 0 && (
              <Grid xs={12} sx={{ pt: 2 }}>
                <Grow>
                  <InlineEditGrid
                    gridValidation={exchangeMapsGridValidation}
                    columns={exchangeMapsInlineGridColumns}
                    defaultRow={{
                      currencyId: formik.values.currencyId ? formik.values.currencyId : '',
                      rateTypeId: formik.values.rateTypeId ? formik.values.rateTypeId : '',
                      exchangeId: exchangeMapsGridValidation.values.exchangeId
                        ? exchangeMapsGridValidation.values.exchangeId
                        : '',
                      plantId: exchangeMapsGridValidation.values.plantId
                        ? exchangeMapsGridValidation.values.plantId
                        : '',
                      exchangeRef: '',
                      exchangeName: ''
                    }}
                    allowDelete={false}
                    allowAddNewLine={false}
                    width={'1200'}
                    scrollable={true}
                  />
                </Grow>
              </Grid>
            )}
          </Grid>
        </Grow>
        <Grid
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: 0,
            textAlign: 'center'
          }}
        >
          <WindowToolbar onSave={handleSubmit} smallBox={true} />
        </Grid>
      </CustomTabPanel>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default CurrencyRateExchangeMap
