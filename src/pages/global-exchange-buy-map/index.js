// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

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

const GlobalExchangeBuyMap = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)
  const { height } = useWindowDimensions()

  //state
  const [currencyStore, setCurrencyStore] = useState([])

  const [errorMessage, setErrorMessage] = useState()
  const [access, setAccess] = useState(0)
  const [labels, setLabels] = useState(null)

  useEffect(() => {
    if (!access) getAccess(ResourceIds.CorrespondentAgentBranch, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        fillCurrencyStore()

        getLabels(ResourceIds.GlobalExchangeBuyMap, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

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

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      rows: yup
        .array()
        .of(
          yup.object().shape({
            countryId: yup.string().required('Country recordId is required'),
            exchangeId: yup.string().required('exchange recordId is required')
          })
        )
        .required('Operations array is required')
    }),
    initialValues: {
      currencyId: '',
      rows: [
        {
          id: 1,
          currencyId: '',
          countryId: '',
          countryName: '',
          countryRef: '',
          exchangeRef: '', // validate red
          exchangeName: '', // validate red
          exchangeId: ''
        }
      ]
    },
    onSubmit: values => {
      postExchangeMaps(values)
    }
  })

  const _labels = {
    country: labels && labels.find(item => item.key === '1') && labels.find(item => item.key === '1').value,
    currency: labels && labels.find(item => item.key === '2') && labels.find(item => item.key === '2').value,
    exchangeTable: labels && labels.find(item => item.key === '3') && labels.find(item => item.key === '3').value,
    name: labels && labels.find(item => item.key === '4') && labels.find(item => item.key === '4').value
  }

  const postExchangeMaps = obj => {
    const data = {
      currencyId: obj.currencyId,
      globalExchangeBuyMaps: obj.rows.map(({ currencyId, ...rest }) => ({
        currencyId: obj.currencyId,
        ...rest
      }))
    }
    postRequest({
      extension: RemittanceSettingsRepository.CorrespondentExchangeBuyMap.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res.statusId) toast.success('Record Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getCurrenciesExchangeMaps = currencyId => {
    formik.setFieldValue(`rows`, [
      {
        id: 1,
        currencyId: '',
        countryId: '',
        countryName: '',
        countryRef: '',
        exchangeRef: '', // validate red
        exchangeName: '', // validate red
        exchangeId: ''
      }
    ])
    const defaultParams = `_currencyId=${currencyId}`
    var parameters = defaultParams
    currencyId &&
      getRequest({
        extension: RemittanceSettingsRepository.CorrespondentExchangeBuyMap.qry,
        parameters: parameters
      })
        .then(res => {
          if (res.list.length > 0) {
            formik.setFieldValue(
              'rows',
              res.list.map(({ ...rest }, index) => ({
                id: index + 1,
                ...rest
              }))
            )
          }
        })
        .catch(error => {
          setErrorMessage(error)
        })
  }
  console.log(formik.values)

  //columns
  const columns = [
    {
      component: 'resourcecombobox',
      label: _labels.country,
      name: 'countryId',
      props: {
        endpointId: SystemRepository.Country.qry,
        valueField: 'recordId',
        displayField: 'reference',
        mapping: [
          { from: 'name', to: 'countryName' },
          { from: 'reference', to: 'countryRef' },
          { from: 'recordId', to: 'countryId' }
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
      name: 'countryName',
      mandatory: false,
      readOnly: true
    },
    {
      component: 'resourcecombobox',
      label: _labels.country,
      name: 'exchangeId',
      props: {
        endpointId: MultiCurrencyRepository.ExchangeTable.qry2,
        parameters: `_currencyId=` + formik.values.currencyId,
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
      mandatory: false,
      readOnly: true
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
            <Grid container xs={12} spacing={4}>
              <Grid item xs={6}>
                <CustomComboBox
                  name='currencyId'
                  label={_labels.currency}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Currency Ref' },
                    { key: 'name', value: 'Name' }
                  ]}
                  store={currencyStore}
                  value={currencyStore.filter(item => item.recordId === formik.values.currencyId)[0]} // Ensure the value matches an option or set it to null
                  required
                  onChange={(event, newValue) => {
                    const selectedCurrencyId = newValue?.recordId || ''

                    formik.setFieldValue('currencyId', selectedCurrencyId)
                    getCurrenciesExchangeMaps(selectedCurrencyId)

                    // formik.setFieldValue('currencyId', selectedCurrencyId)

                    // Fetch and update state data based on the selected country
                  }}
                  error={formik.errors && Boolean(formik.errors.currencyId)}
                  helperText={formik.touched.currencyId && formik.errors.currencyId}
                />
              </Grid>
            </Grid>
            {
              <Grid xs={12} sx={{ pt: 2 }}>
                <Box>
                  <DataGrid
                    onChange={value => formik.setFieldValue('rows', value)}
                    value={formik.values.rows}
                    error={formik.errors.rows}
                    columns={columns}
                    height={`calc(100vh - 180px)`}
                  />
                </Box>
              </Grid>
            }
          </Grid>
        </Box>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            margin: 0
          }}
        >
          <WindowToolbar onSave={handleSubmit} isSaved={true} smallBox={true} />
        </Box>
      </CustomTabPanel>
    </Box>
  )
}

export default GlobalExchangeBuyMap
