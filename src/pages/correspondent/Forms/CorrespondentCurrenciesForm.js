import { Box } from '@mui/material'
import { useFormik } from 'formik'
import { DataGrid } from 'src/components/Shared/DataGrid'

// ** Custom Imports
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useWindow } from 'src/windows'
import ExchangeMapForm from '../Forms/ExchangeMapForm'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

const CorrespondentCurrenciesForm = ({
  store,
  labels,
  maxAccess,
  editMode
}) => {

  const {recordId , counties} = store
  const { stack } = useWindow()
  const { getRequest, postRequest } = useContext(RequestsContext)

   // CURRENCIES TAB
   const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,

    // validate: values => {
    //   const isValid = values.currencies.every(row => !!row.currency?.recordId)

    //   return isValid
    //     ? {}
    //     : { currencies: Array(values.currencies.length).fill({ currencyId: 'Currency is required' }) }
    // },
    initialValues: {
      currencies: [
        { id: 1,
          corId: recordId,
          currencyId: '',
          currencyRef: '',
          currencyName: '',
          exchangeId: '',
          exchangeRef: '',
          exchangeName: '',
          outward: false,
          inward: false,
          bankDeposit: false,
          deal: false,
          isInactive: false
        }
      ]
    },
    onSubmit: values => {
      console.log(values)
      postCorrespondentCurrencies(values)
    }
  })

  const postCorrespondentCurrencies = obj => {

    const correspondentCurrencies = obj?.currencies?.map(
      ({ currency,  exchange, currencyId ,exchangeId,  ...rest }) => ({
         currencyId: currency?.recordId,
         exchangeId: exchange?.recordId,
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
        if (!res.recordId) toast.success('Record Added Successfully')
        else toast.success('Record Edited Successfully')
      })
      .catch(error => {
      })
  }

  const columns = [
    {
      component: 'resourcecombobox',
      name: 'currency',
      label: labels.Currency,
      props: {
        endpointId: SystemRepository.Currency.qry,
        valueField: 'recordId',
        displayField: 'reference',

        // fieldsToUpdate: [{ from: 'name', to: 'currencyName' }],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' },
        ]
      }
    },

    {
      component: 'resourcecombobox',
      name: 'exchange',
      label: labels.exchange,
      props: {
        endpointId: MultiCurrencyRepository.ExchangeTable.qry,
        valueField: 'recordId',
        displayField: 'reference',

        // fieldsToUpdate: [{ from: 'name', to: 'exchangeName' }],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' },
        ]
      }
    },

    {
      component: 'checkbox',
       name: 'outward',
      label: labels.outward
    },

    {
      component: 'checkbox',
      label: labels.inward,
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
      label: labels.isInactive,
      name: 'isInactive'
    },
    {
      component: 'button',
      label: labels.exchange,
      name: 'exchanges',
      onClick:  async (e, row) => {

     row?.currency &&   stack({
          Component: ExchangeMapForm,
          props: {
            labels: labels,
            recordId: recordId? recordId : null,
            store: store,
            currency: row?.currency
          },
          width: 700,
          height: 600,
          title: "Correspondent"
        })
      }
    },
  ]

  useEffect(()=>{
    const defaultParams = `_corId=${recordId}`
    var parameters = defaultParams
    recordId && getRequest({
      extension: RemittanceSettingsRepository.CorrespondentCurrency.qry,
      parameters: parameters
    })
      .then(res => {
        if (res?.list?.length > 0) {
          formik.setValues({ currencies: res.list.map(
            ({ currencyId,  currencyRef, exchangeId, exhangeRef, ...rest } , index) => ({
               id : index,
               currency : {
                recordId: currencyId,
                reference: currencyRef,
              }, exchange : {
                recordId: exchangeId,
                reference: exchangeRef,
              },  ...rest
}))})
        } else {
          formik.setValues({
            currencies: [
              {  id : 1,
                corId: recordId,
                currencyId: '',
                currencyRef: '',
                currencyName: '',
                exchangeId: '',
                exchangeRef: '',
                exchangeName: '',
                outward: false,
                inward: false,
                bankDeposit: false,
                deal: false,
                isInactive: false
              }
            ]
          })
        }
      })
      .catch(error => {
      })


},[recordId])

return (
  <FormShell
  form={formik}
  resourceId={ResourceIds.Correspondent}
  maxAccess={maxAccess}
  editMode={editMode} >
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
      <DataGrid
          onChange={value => formik.setFieldValue('currencies', value)}
          value={formik.values.currencies}
          error={formik.errors.currencies}
          columns={columns}
        />
      </Box>
    </FormShell>
  )
}

export default CorrespondentCurrenciesForm
