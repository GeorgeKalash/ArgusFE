import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const ProductCountriesForm = ({ store, setStore, labels, editMode, height, expanded, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId: pId } = store

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,

    validationSchema: yup.object({
      countries: yup
        .array()
        .of(
          yup.object().shape({
            countryId: yup.string().required(' '),
            rateTypeId: yup.string().required(' ')
          })
        )
        .required('Operations array is required')
    }),
    initialValues: {
      countries: [{ id: 1, productId: pId, countryId: '', countryRef: '', countryName: '', isInactive: false }]
    },
    onSubmit: values => {
      postProductCountries(values.countries)
    }
  })

  const postProductCountries = obj => {
    const data = {
      productId: pId,
      productCountries: obj.map(({ productId, ...rest }) => ({
        productId: pId,
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
      .catch(error => {})
  }

  const column = [
    {
      component: 'resourcecombobox',
      label: labels.country,
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
      label: labels.name,
      name: 'countryName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.rateType,
      name: 'rateTypeId',
      props: {
        endpointId: MultiCurrencyRepository.RateType.qry,
        valueField: 'recordId',
        displayField: 'name',
        displayFieldWidth: 1.5,
        mapping: [
          { from: 'name', to: 'rateTypeName' },
          { from: 'reference', to: 'rateTypeRef' },
          { from: 'recordId', to: 'rateTypeId' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'checkbox',
      label: labels.isInactive,
      name: 'isInactive'
    }
  ]

  useEffect(() => {
    pId && getCountries(pId)
  }, [pId])

  const getCountries = pId => {
    const defaultParams = `_productId=${pId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductCountries.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) {
          const countries = res.list.map(({ countryId, countryRef, countryName, ...rest }, index) => ({
            id: index,
            countryId,
            countryRef,
            countryName,
            ...rest
          }))
          formik.setValues({ countries: countries })

          setStore(prevStore => ({
            ...prevStore,
            countries: countries
          }))
        }
      })
      .catch(error => {})
  }

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.ProductMaster}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('countries', value)}
            value={formik.values.countries}
            error={formik.errors.countries}
            columns={column}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ProductCountriesForm
