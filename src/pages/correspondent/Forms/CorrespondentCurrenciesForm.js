import { Box } from '@mui/material'
import { useFormik } from 'formik'
import { DataGrid } from 'src/components/Shared/DataGrid'

// ** Custom Imports
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useWindow } from 'src/windows'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const CorrespondentCurrenciesForm = ({ store, labels, maxAccess, expanded, editMode }) => {
  const { recordId, counties } = store
  const { stack } = useWindow()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      currencies: yup
        .array()
        .of(
          yup.object().shape({
            currencyId: yup.string().required('currency  is required')
          })
        )
        .required('currencies array is required')
    }),
    initialValues: {
      currencies: [
        {
          id: 1,
          corId: recordId,
          currencyId: '',
          currencyRef: '',
          currencyName: '',
          outward: false,
          inward: false,
          bankDeposit: false,
          deal: false,
          goc: false,
          isInactive: false,
          saved: false
        }
      ]
    },
    onSubmit: values => {
      postCorrespondentCurrencies(values)
    }
  })

  const postCorrespondentCurrencies = obj => {
    const correspondentCurrencies = obj?.currencies?.map(({ corId, ...rest }) => ({
      corId: recordId,
      ...rest
    }))

    const data = {
      corId: recordId,
      correspondentCurrencies: correspondentCurrencies
    }
    postRequest({
      extension: RemittanceSettingsRepository.CorrespondentCurrency.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success(platformLabels.Edited)
        if (res) getData()
      })
      .catch(error => {})
  }

  const columns = [
    {
      component: 'resourcecombobox',
      name: 'currencyId',
      label: labels.currency,
      props: {
        endpointId: SystemRepository.Currency.qry,
        valueField: 'recordId',
        displayField: 'reference',
        mapping: [
          { from: 'recordId', to: 'currencyId' },
          { from: 'reference', to: 'currencyRef' },
          { from: 'name', to: 'currencyName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 3
      }
    },
    {
      component: 'checkbox',
      name: 'outward',
      label: labels.outwards
    },

    {
      component: 'checkbox',
      label: labels.inwards,
      name: 'inward'
    },
    {
      component: 'checkbox',
      label: labels.bankDeposit,
      name: 'bankDeposit'
    },
    {
      component: 'checkbox',
      label: labels.deal,
      name: 'deal'
    },
    {
      component: 'checkbox',
      label: labels.consignation,
      name: 'goc'
    },
    {
      component: 'checkbox',
      label: labels.isInActive,
      name: 'isInactive'
    }

    // {
    //   component: 'button',
    //   name: 'saved',
    //   label: labels.exchange,
    //   onClick: async (e, row) => {
    //     stack({
    //       Component: ExchangeMapForm,
    //       props: {
    //         labels: labels,
    //         recordId: recordId ? recordId : null,
    //         store: store,
    //         currency: { currencyId: row?.currencyId, currencyName: row?.currencyName },
    //         exchange: { exchangeId: row?.exchangeId, exchangeName: row?.exchangeName }
    //       },
    //       width: 700,
    //       height: 600,
    //       title: labels.sellingPriceExchangeMap
    //     })
    //   }
    // }
  ]

  function getData() {
    const defaultParams = `_corId=${recordId}`
    var parameters = defaultParams
    recordId &&
      getRequest({
        extension: RemittanceSettingsRepository.CorrespondentCurrency.qry,
        parameters: parameters
      })
        .then(res => {
          if (res?.list?.length > 0) {
            formik.setValues({
              currencies: res.list.map(({ ...rest }, index) => ({
                id: index,
                saved: true,
                ...rest
              }))
            })
          } else {
            formik.setValues({
              currencies: [
                {
                  id: 1,
                  corId: recordId,
                  currencyId: '',
                  currencyRef: '',
                  currencyName: '',
                  outward: false,
                  inward: false,
                  bankDeposit: false,
                  deal: false,
                  goc: false,
                  isInactive: false,
                  saved: false
                }
              ]
            })
          }
        })
        .catch(error => {})
  }
  useEffect(() => {
    getData()
  }, [recordId])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Correspondent}
      infoVisible={false}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('currencies', value)}
            value={formik.values.currencies}
            error={formik.errors.currencies}
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default CorrespondentCurrenciesForm
