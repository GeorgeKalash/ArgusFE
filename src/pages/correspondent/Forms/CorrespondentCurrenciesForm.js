import { Box } from '@mui/material'
import { useFormik } from 'formik'
import { DataGrid } from 'src/components/Shared/DataGrid'

// ** Custom Imports
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useWindow } from 'src/windows'
import ExchangeMapWindow from '../Windows/ExchangeMapWindow'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'

const CorrespondentCurrenciesForm = ({
  store,
  labels,
  maxAccess,
  editMode
}) => {

  const {recordId} = store
  const { stack } = useWindow()

   // CURRENCIES TAB
   const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {
      const isValid = values.currencies.every(row => !!row.currencyId)

      return isValid
        ? {}
        : { currencies: Array(values.currencies.length).fill({ currencyId: 'Currency is required' }) }
    },
    initialValues: {
      currencies: [
        { id: 1,
          corId: recordId,

          // currencies: '',
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
      postCorrespondentCurrencies(values.currencies)
    }
  })

  const columns = [
    {
      component: 'resourcecombobox',
      name: 'currency',
      label: labels.Currency,
      props: {
        endpointId: SystemRepository.Currency.qry,
        valueField: 'recordId',
        displayField: 'reference',
        fieldsToUpdate: [{ from: 'name', to: 'currencyName' }],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' },
        ]
      }
      ,
    },

    {
      component: 'resourcecombobox',
      name: 'exchange',
      label: labels.exchange,
      props: {
        endpointId: MultiCurrencyRepository.ExchangeTable.qry,
        valueField: 'recordId',
        displayField: 'reference',
        fieldsToUpdate: [{ from: 'name', to: 'exchangeName' }],
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
      header: labels.isInactive,
      name: 'isInactive'
    },
    {
      component: 'button',
      header: labels.exchange,
      name: 'exchanges',
      onClick: (e, row) => {
      console.log(e, row)

        stack({
          Component: ExchangeMapWindow,
          props: {
            labels: labels,
            recordId: recordId? recordId : null,
            store: store,
          },
          width: 700,
          height: 600,
          title: "Correspondent"
        })
      }
    },
  ]

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
