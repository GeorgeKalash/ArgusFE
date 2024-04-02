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
  expanded,
  maxAccess
}) => {

  const {recordId : pId , countries} = store
  const { getRequest, postRequest } = useContext(RequestsContext)

  const formik = useFormik({
    validationSchema: yup.object({ currencies: yup
      .array()
      .of(
        yup.object().shape({
            countryId: yup.string().required('currency  is required'),
            countryId: yup.string().required('Country  is required'),
            dispersalType: yup.string().required('Dispersal Type  is required')
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
        ({ id,  productId,...rest} ) => ({
            productId: pId,
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
      name: 'countryId',
      props: {
        store: countries,
        valueField: 'countryId',
        displayField: 'countryRef',
        displayFieldWidth: 2,
        mapping: [  { from: 'countryId', to: 'countryId' }, { from: 'countryName', to: 'countryName' } ,, { from: 'countryRef', to: 'countryRef' }  ],
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
      name: 'currencyId',
      props: {
        endpointId: SystemRepository.Currency.qry,
        valueField: 'recordId',
        displayField: 'reference',
        mapping: [{ from: 'recordId', to: 'currencyId' }, { from: 'reference', to: 'currencyRef' } , { from: 'name', to: 'currencyName' } ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' },
        ],
        displayFieldWidth: 2

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
        displayFieldWidth: 2,
        mapping: [{ from: 'key', to: 'dispersalType' }, { from: 'value', to: 'dispersalTypeName' }],

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
         formik.setValues({ currencies: res.list.map(({  ...rest } , index) => ({
          id : index,
          ...rest
       })) })
      })
  }

return (
  <FormShell form={formik}
   resourceId={ResourceIds.ProductMaster}
   maxAccess={maxAccess}
   infoVisible={false}
   editMode={editMode}>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <DataGrid
          onChange={value => formik.setFieldValue('currencies', value)}
          value={formik.values.currencies}
          error={formik.errors.currencies}
          columns={columns}
          height={`${expanded ? `calc(100vh - 280px)` : `${height-100}px`}`}

        />
      </Box>
    </FormShell>
  )
}


export default ProductCurrenciesForm
