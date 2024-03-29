import { Box } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'

// ** Custom Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

const ProductCountriesForm = ({
  store,
  setStore,
  labels,
  editMode,
  height,
  maxAccess
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const {recordId : pId } = store

  const formik = useFormik({
      enableReinitialize: false,
      validateOnChange: true,
      validationSchema: yup.object({ countries: yup
        .array()
        .of(
          yup.object().shape({
            country: yup
              .object()
              .shape({
                recordId: yup.string().required('Country recordId is required')
              })
              .required('Country is required'),
          })
        ).required('Operations array is required') }),
      initialValues: {
        countries: [
          { id :1,
            productId: pId,
            countryId: '',
            countryRef: '',
            countryName: '',
            isInactive: false
          }
        ]
      },
      onSubmit: values => {
        postProductCountries(values.countries)
      }
    })

    const postProductCountries = obj => {

      const data = {
        productId: pId,
        productCountries : obj?.map(
        ({country, id, countryId,productId,...rest} ) => ({
          productId: pId,
            countryId: country.recordId,
            ...rest
        }))
      }
      postRequest({
        extension: RemittanceSettingsRepository.ProductCountries.set2,
        record: JSON.stringify(data)
      })
        .then(res => {
          if (res) toast.success('Record Edited Successfully')
          getCountries(pId)
        })
        .catch(error => {
          setErrorMessage(error)
        })
    }

    const column = [
      {
        component: 'resourcecombobox',
        label: labels.country,
        name: 'country',
        props: {
          endpointId: SystemRepository.Country.qry,
          valueField: 'recordId',
          displayField: 'reference',
          fieldsToUpdate: [ { from: 'name', to: 'countryName' } ],
          columnsInDropDown: [
            { key: 'reference', value: 'Reference' },
            { key: 'name', value: 'Name' },
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
        component: 'checkbox',
        label: labels.isInactive,
        name: 'isInactive'
      }
    ]

    useEffect(()=>{
      pId  && getCountries(pId)
    }, [pId])

    const getCountries = pId => {
      const defaultParams = `_productId=${pId}`
      var parameters = defaultParams
      getRequest({
        extension: RemittanceSettingsRepository.ProductCountries.qry,
        parameters: parameters
      })
        .then(res => {
          if (res.list.length > 0){
            const countries = res.list.map(({ countryId,  countryRef, countryName, ...rest } , index) => ({
               id : index,
               country : {
               recordId: countryId,
               name: countryName,
               reference: countryRef
              },
              countryId,
              countryRef,
              countryName,
               ...rest
            }))
            formik.setValues({ countries: countries})

          setStore(prevStore => ({
            ...prevStore,
            countries: countries,
          }));

          }

        })
        .catch(error => {
        })
    }

  return (
    <FormShell form={formik}
      resourceId={ResourceIds.ProductMaster}
      maxAccess={maxAccess}
      editMode={editMode}>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', scroll: 'none', overflow:'hidden' }}>
        <DataGrid
           onChange={value => formik.setFieldValue('countries', value)}
           value={formik.values.countries}
           error={formik.errors.countries}
           columns={column}
           height={height-100}
        />
      </Box>
    </FormShell>
  )
}

export default ProductCountriesForm
