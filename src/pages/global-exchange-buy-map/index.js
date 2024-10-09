import { useEffect, useState, useContext } from 'react'
import { Grid } from '@mui/material'
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
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const GlobalExchangeBuyMap = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)
  const { height } = useWindowDimensions()
  const { platformLabels } = useContext(ControlContext)

  const [errorMessage, setErrorMessage] = useState()
  const [access, setAccess] = useState(0)
  const [labels, setLabels] = useState(null)

  useEffect(() => {
    if (!access) getAccess(ResourceIds.CorrespondentAgentBranch, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getLabels(ResourceIds.GlobalExchangeBuyMap, setLabels)
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
            countryId: yup.string().required(''),
            exchangeId: yup.string().required('')
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
    onSubmit: async values => {
      await postExchangeMaps(values)
    }
  })

  const _labels = {
    country: labels && labels.find(item => item.key === '1') && labels.find(item => item.key === '1').value,
    currency: labels && labels.find(item => item.key === '2') && labels.find(item => item.key === '2').value,
    exchangeTable: labels && labels.find(item => item.key === '3') && labels.find(item => item.key === '3').value,
    name: labels && labels.find(item => item.key === '4') && labels.find(item => item.key === '4').value
  }

  const postExchangeMaps = async obj => {
    const data = {
      currencyId: obj.currencyId,
      globalExchangeBuyMaps: obj.rows.map(({ currencyId, ...rest }) => ({
        currencyId: obj.currencyId,
        ...rest
      }))
    }
    await postRequest({
      extension: RemittanceSettingsRepository.CorrespondentExchangeBuyMap.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res.statusId) toast.success(platformLabels.Updated)
      })
      .catch(error => {})
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
        .catch(error => {})
  }

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
        displayFieldWidth: 1.2,
        mapping: [
          { from: 'name', to: 'countryName' },
          { from: 'reference', to: 'countryRef' },
          { from: 'recordId', to: 'countryId' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' },
          { key: 'flName', value: 'Foreign Language Name' }
        ]
      }
    },
    {
      component: 'textfield',
      label: _labels.name,
      name: 'countryName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: _labels.exchangeTable,
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
      props: {
        readOnly: true
      }
    }
  ]

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  return (
    <VertLayout>
      <Fixed>
        <Grid container>
          <Grid item xs={3}>
            <ResourceComboBox
              endpointId={SystemRepository.Currency.qry}
              name='currencyId'
              label={_labels.currency}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Currency Ref' },
                { key: 'name', value: 'Name' },
                { key: 'flName', value: 'Foreign Language Name' }
              ]}
              values={formik.values}
              required
              maxAccess={access}
              onChange={(event, newValue) => {
                const selectedCurrencyId = newValue?.recordId || ''
                formik.setFieldValue('currencyId', selectedCurrencyId)
                getCurrenciesExchangeMaps(selectedCurrencyId)
              }}
              error={formik.errors && Boolean(formik.errors.currencyId)}
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        {formik.values.currencyId && (
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values.rows}
            error={formik.errors.rows}
            columns={columns}
          />
        )}
      </Grow>
      <Fixed>
        <WindowToolbar onSave={handleSubmit} isSaved={true} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

export default GlobalExchangeBuyMap
