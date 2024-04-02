import { Box } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'

const ProductCurrenciesForm = ({
  store,
  labels,
  editMode,
  height,
  maxAccess
}) => {

  const {recordId : pId , countries} = store
  const { getRequest, postRequest } = useContext(RequestsContext)

  const formik = useFormik({
    validationSchema: yup.object({ currencies: yup
      .array()
      .of(
        yup.object().shape({
          currency: yup
            .object()
            .shape({
              recordId: yup.string().required('currency  is required')
            })
            .required('currency is required'),
            country : yup
            .object()
            .shape({
              countryId: yup.string().required('Country  is required')
            })
            .required('Country is required'),
            dispersalType : yup
            .object()
            .shape({
              key: yup.string().required('Dispersal Type  is required')
            })
            .required('Country is required'),
        })

      ).required('Operations array is required') }),
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
      post(values.currencies)
    }
  })

  const post = obj => {
    const data = {
      productId: pId,
      productMonetaries: obj.map(
        ({ country, id, countryId, currency, currencyId, dispersalType, productId,...rest} ) => ({
            productId: pId,
            countryId: country.countryId,
            currencyId: currency.recordId,
            dispersalType: dispersalType.key,
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
      label: labels.country,
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
      label: labels.name,
      name: 'countryName',
      mandatory: false,
      readOnly: true
    },
    {
      component: 'resourcecombobox',
      label: labels.currency,
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
      label: labels.name,
      name: 'currencyName',
      mandatory: false,
      readOnly: true
    },

    {
      component: 'resourcecombobox',
      label: labels.dispersalType,
      name: 'dispersalType',
      props: {
        datasetId:  DataSets.RT_Dispersal_Type,
        valueField: 'key',
        displayField: 'value',
      }

    },
    {
      component: 'checkbox',
      label: labels.isInactive,
      name: 'isInactive'
    }
  ]

  useEffect(()=>{
    pId  && getMonetaries(pId)
  }, [pId])

  const getMonetaries = pId => {

    const defaultParams = `_productId=${pId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductMonetaries.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0)
         formik.setValues({ currencies: res.list.map(({ countryId,  countryRef, countryName,currencyId,currencyName,currencyRef, dispersalType, dispersalTypeName, ...rest } , index) => ({
          id : index,
          country : {
            countryId,
            countryRef
         },
         countryName: countryName,
         currency : {
          recordId: currencyId,
          reference: currencyRef
         },
         currencyName: currencyName,
          dispersalType :{
          key: dispersalType,
          value: dispersalTypeName
         },

          ...rest
       })) })
      })
  }

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


export default ProductCurrenciesForm
