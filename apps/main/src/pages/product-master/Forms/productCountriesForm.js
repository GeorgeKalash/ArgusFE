import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const ProductCountriesForm = ({ store, setStore, labels, editMode, height, expanded, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId: pId } = store
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    validateOnChange: true,

    validationSchema: yup.object({
      countries: yup
        .array()
        .of(
          yup.object().shape({
            countryId: yup.string().required(' ')
          })
        )
        .required('Operations array is required')
    }),
    initialValues: {
      countries: [
        {
          id: 1,
          productId: pId,
          countryId: '',
          countryRef: '',
          countryName: '',
          purcRateTypeId: null,
          saleRateTypeId: null,
          isInactive: false
        }
      ]
    },
    onSubmit: async values => {
      const transformedValues = {
        ...values,
        countries: values.countries.map(country => ({
          ...country,
          purcRateTypeId: country.purcRateTypeId === '' ? null : country.purcRateTypeId,
          saleRateTypeId: country.saleRateTypeId === '' ? null : country.saleRateTypeId
        }))
      }
      await postProductCountries(transformedValues.countries)
    }
  })

  const postProductCountries = async obj => {
    const data = {
      productId: pId,
      productCountries: obj.map(({ productId, ...rest }) => ({
        productId: pId,
        ...rest
      }))
    }
    await postRequest({
      extension: RemittanceSettingsRepository.ProductCountries.set2,
      record: JSON.stringify(data)
    }).then(res => {
      if (res) toast.success(platformLabels.Edited)
      getCountries(pId)
    })
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
        displayFieldWidth: 2,
        mapping: [
          { from: 'name', to: 'countryName' },
          { from: 'reference', to: 'countryRef' },
          { from: 'recordId', to: 'countryId' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' },
          { key: 'flName', value: 'FlName' }
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
      label: labels.saleRateType,
      name: 'saleRateTypeId',
      props: {
        endpointId: MultiCurrencyRepository.RateType.qry,
        valueField: 'recordId',
        displayField: 'name',
        displayFieldWidth: 1.5,
        mapping: [
          { from: 'name', to: 'saleRateTypeName' },
          { from: 'reference', to: 'saleRateTypeRef' },
          { from: 'recordId', to: 'saleRateTypeId' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.purcRateType,
      name: 'purcRateTypeId',
      props: {
        endpointId: MultiCurrencyRepository.RateType.qry,
        valueField: 'recordId',
        displayField: 'name',
        displayFieldWidth: 1.5,
        mapping: [
          { from: 'name', to: 'purcRateTypeName' },
          { from: 'reference', to: 'purcRateTypeRef' },
          { from: 'recordId', to: 'purcRateTypeId' }
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
    }).then(res => {
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
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            name='rows'
            onChange={value => formik.setFieldValue('countries', value)}
            value={formik.values.countries}
            error={formik.errors.countries}
            columns={column}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default ProductCountriesForm
