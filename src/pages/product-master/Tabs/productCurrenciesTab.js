import { Box } from '@mui/material'
import { useFormik } from 'formik'
import { useContext } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

const ProductCurrenciesTab = ({
  store,
  labels,
  editMode,
  height,
  maxAccess
}) => {

  const {recordId : pId , countries} = store
  const { getRequest, postRequest } = useContext(RequestsContext)

  const formik = useFormik({
    initialValues: {
      currencies: [
        { id:1,
          productId: pId,
          countryId: '',
          countryRef: '',
          countryName: '',
          currencyId: '',
          currencyRef: '',
          currencyName: '',
          dispersalType: '',
          dispersalTypeName: '',
          isInactive: false
        }
      ]
    },
    enableReinitialize: false,
    validateOnChange: true,
    onSubmit: values => {
      postProductMonetaries(values.currencies)
    }
  })

  const postProductMonetaries = obj => {
    const data = {
      productId: pId,
      productMonetaries: obj.map(
        ({ country, id, countryId, currency, currencyId, dispersalType, dispersal,...rest} ) => ({
            productId: pId,
            countryId: country.countryId,
            currencyId: currency.recordId,
            dispersalType: dispersal.recordId,
            ...rest
        }))
    }
    postRequest({
      extension: RemittanceSettingsRepository.ProductMonetaries.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Edited Successfully')
      })
      .catch(error => {
        // setErrorMessage(error)
      })
  }

  const columns = [
    {
      component: 'resourcecombobox',
      header: 'Country',
      name: 'country',
      props: {
        store: countries,
        valueField: 'countryId',
        displayField: 'countryRef',
        fieldsToUpdate: [ { from: 'countryName', to: 'countryName' } ],
        columnsInDropDown: [
          { key: 'countryRef', value: 'Reference' },
          { key: 'countryName', value: 'Name' },
        ]
      }
    },
    {
      component: 'textfield',
      header: 'name',
      name: 'countryName',
      mandatory: false,
      readOnly: true
    },
    {
      component: 'resourcecombobox',
      label: 'Currency',
      name: 'currency',
      props: {
        endpointId: SystemRepository.Currency.qry,
        valueField: 'recordId',
        displayField: 'reference',
        fieldsToUpdate: [ { from: 'name', to: 'currencyName' } ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' },
        ]
      }
    },
    {
      component: 'textfield',
      label: 'name',
      name: 'currencyName',
      mandatory: false,
      readOnly: true
    },

    {
      component: 'resourcecombobox',
      label: 'Dispersal Type',
      name: 'dispersal',
      props: {
        endpointId: RemittanceSettingsRepository.ProductDispersal.qry,
        parameters :`_productId=${pId}`,
        valueField: 'recordId',
        displayField: 'reference',

        // fieldsToUpdate: [ { from: 'name', to: 'dispersalName' } ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' },
        ]
      }
    },
    {
      component: 'checkbox',
      label: 'is inactive',
      name: 'isInactive'
    }
  ]

return (
  <FormShell form={formik}
   resourceId={ResourceIds.ProductMaster}
   maxAccess={maxAccess}
   editMode={editMode}>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <DataGrid
          onChange={value => formik.setFieldValue('currencies', value)}
          value={formik.values.currencies}
          error={formik.errors.currencies}
          columns={columns}
          scrollHeight={height-100}

        />
      </Box>
    </FormShell>
  )
}


export default ProductCurrenciesTab
