// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox, DialogActions } from '@mui/material'

// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import { DataGrid } from 'src/components/Shared/DataGrid'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

const NumberRange = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //state
  const [currencyStore, setCurrencyStore] = useState([])
  const [countryStore, setCountryStore] = useState([])
  const [errorMessage, setErrorMessage] = useState()
  const [access, setAccess] = useState(0)
  const [labels, setLabels] = useState(null)
  const { height } = useWindowDimensions()

  useEffect(() => {
    if (!access) getAccess(ResourceIds.currencyExchangeMap, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getLabels(ResourceIds.currencyExchangeMap, setLabels)
        fillCurrencyStore()
        fillCountryStore()
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      rows: yup
        .array()
        .of(
          yup.object().shape({
            exchangeId: yup.string().required('Country recordId is required')
          })
        )
        .required('Operations array is required')
    }),
    initialValues: {
      currencyId: '',
      countryId: '',
      rows: [
        {
          id: 1,
          currencyId: '',
          countryId: '',
          plantId: '',
          countryName: '',
          plantName: '',
          exchangeRef: '',
          exchangeId: '',
          exchangeName: ''
        }
      ]
    },
    onSubmit: values => {
      postExchangeMaps(values)
    }
  })

  const fillCurrencyStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: parameters
    })
      .then(res => {
        setCurrencyStore(res.list)
      })
      .catch(error => {})
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

  const fillExchangeTableStore = id => {
    setExchangeTableStore({})

    var parameters = `_currencyId=` + id
    getRequest({
      extension: MultiCurrencyRepository.ExchangeTable.qry2,
      parameters: parameters
    })
      .then(res => {
        console.log(res)
        setExchangeTableStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const _labels = {
    country: labels && labels.find(item => item.key === '1') && labels.find(item => item.key === '1').value,
    currency: labels && labels.find(item => item.key === '2') && labels.find(item => item.key === '2').value,
    exchangeTable: labels && labels.find(item => item.key === '3') && labels.find(item => item.key === '3').value,
    plant: labels && labels.find(item => item.key === '4') && labels.find(item => item.key === '4').value,
    name: labels && labels.find(item => item.key === '5') && labels.find(item => item.key === '5').value
  }

  const postExchangeMaps = obj => {
    const data = {
      currencyId: formik.values.currencyId,
      countryId: formik.values.countryId,
      globalExchangeMaps: obj.rows.map(({ countryId, currencyId, ...rest }) => ({
        countryId,
        currencyId,
        ...rest
      }))
    }
    postRequest({
      extension: RemittanceSettingsRepository.CurrencyExchangeMap.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res.statusId) toast.success('Record Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getCurrenciesExchangeMaps = (currencyId, countryId) => {
    formik.setFieldValue('rows', [])
    const parameters = ''

    currencyId &&
      countryId &&
      getRequest({
        extension: SystemRepository.Plant.qry,
        parameters: parameters
      })
        .then(plants => {
          const defaultParams = `_currencyId=${currencyId}&_countryId=${countryId}`
          var parameters = defaultParams
          getRequest({
            extension: RemittanceSettingsRepository.CurrencyExchangeMap.qry,
            parameters: parameters
          })
            .then(values => {
              const valuesMap = values.list.reduce((acc, fee) => {
                acc[fee.plantId] = fee

                return acc
              }, {})

              const rows = plants.list.map((plant, index) => {
                const value = valuesMap[plant.recordId] || 0

                return {
                  id: index + 1,
                  currencyId: currencyId,
                  countryId: countryId,
                  plantId: plant.recordId,
                  plantName: plant.name,
                  exchangeId: value.exchangeId ? value.exchangeId : '',
                  plantRef: plant.reference,
                  exchangeRef: value.exchangeRef ? value.exchangeRef : '',
                  exchangeName: value.exchangeName ? value.exchangeName : ''
                }
              })

              formik.setFieldValue('rows', rows)
            })
            .catch(error => {
              setErrorMessage(error)
            })
        })
        .catch(error => {
          setErrorMessage(error)
        })
  }

  //columns
  const columns = [
    {
      component: 'textfield',
      label: _labels.plant, //label
      name: 'plantRef',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: _labels.name, //label
      name: 'plantName',
      props: { readOnly: true }
    },

    {
      component: 'resourcecombobox',
      label: _labels.exchangeTable,
      name: 'exchangeId',
      props: {
        endpointId: MultiCurrencyRepository.ExchangeTable.qry2,
        parameters: `_currencyId=${formik.values.currencyId}`,
        valueField: 'recordId',
        displayField: 'reference',
        mapping: [
          { from: 'name', to: 'exchangeName' },
          { from: 'reference', to: 'exchangeRef' },
          { from: 'recordId', to: 'exchangeId' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'textfield',
      label: _labels.name,
      name: 'exchangeName',
      props: { readOnly: true }
    }
  ]

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  return (
    <Box
      sx={{
        height: `${height - 80}px`
      }}
    >
      <CustomTabPanel index={0} value={0}>
        <Box>
          <Grid container>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={6}>
                <ResourceComboBox
                  endpointId={SystemRepository.Country.qry}
                  name='countryId'
                  label={_labels.country}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' },
                    { key: 'flName', value: 'Foreign Language Name' }
                  ]}
                  values={formik.values}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  required
                  maxAccess={access}
                  onChange={(event, newValue) => {
                    const selectedCurrencyId = newValue?.recordId || ''
                    formik.setFieldValue('countryId', selectedCurrencyId)
                    getCurrenciesExchangeMaps(formik.values.currencyId, selectedCurrencyId)
                  }}
                  error={formik.errors && Boolean(formik.errors.countryId)}
                  helperText={formik.touched.countryId && formik.errors.countryId}
                />
              </Grid>

              <Grid item xs={6}>
                <ResourceComboBox
                  endpointId={SystemRepository.Currency.qry}
                  name='currencyId'
                  label={_labels.currency}
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
                    const selectedCurrencyId = newValue?.recordId || ''
                    formik.setFieldValue('currencyId', selectedCurrencyId)
                    getCurrenciesExchangeMaps(selectedCurrencyId, formik.values.countryId)

                    // Fetch and update state data based on the selected country
                  }}
                  error={formik.errors && Boolean(formik.errors.currencyId)}
                  helperText={formik.touched.currencyId && formik.errors.currencyId}
                />
              </Grid>
            </Grid>
            {formik.values.currencyId && formik.values.countryId && (
              <Grid xs={12} sx={{ pt: 2 }}>
                <Box>
                  <DataGrid
                    onChange={value => formik.setFieldValue('rows', value)}
                    value={formik.values.rows}
                    error={formik.errors.rows}
                    columns={columns}
                    height={`calc(100vh - 180px)`}
                    allowDelete={false}
                    allowAddNewLine={false}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
        <Grid
          sx={{
            // height:`${height/10}px`,
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: 0,
            textAlign: 'center'
          }}
        >
          <WindowToolbar onSave={handleSubmit} isSaved={true} smallBox={true} />
        </Grid>
      </CustomTabPanel>
    </Box>
  )
}

export default NumberRange
