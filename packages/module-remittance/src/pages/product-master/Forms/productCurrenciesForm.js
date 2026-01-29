import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const ProductCurrenciesForm = ({ store, setStore, labels, editMode, maxAccess }) => {
  const { recordId: pId, countries } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    validationSchema: yup.object({
      currencies: yup
        .array()
        .of(
          yup.object().shape({
            countryId: yup.string().required(),
            countryId: yup.string().required(),
            dispersalType: yup.string().required()
          })
        )
        .required()
    }),
    initialValues: {
      currencies: [
        {
          id: 1,
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
    validateOnChange: true,
    onSubmit: async values => {
      await post(values.currencies)
    }
  })

  const post = async obj => {
    const data = {
      productId: pId,
      productMonetaries: obj.map(({ id, productId, ...rest }) => ({
        productId: pId,
        ...rest
      }))
    }
    await postRequest({
      extension: RemittanceSettingsRepository.ProductMonetaries.set2,
      record: JSON.stringify(data)
    }).then(res => {
      if (res) toast.success(platformLabels.Edited)
      getMonetaries(pId)
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
        mapping: [
          { from: 'countryId', to: 'countryId' },
          { from: 'countryName', to: 'countryName' },
          { from: 'countryRef', to: 'countryRef' }
        ],
        columnsInDropDown: [
          { key: 'countryRef', value: 'Reference' },
          { key: 'countryName', value: 'Name' }
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
      label: labels.currency,
      name: 'currencyId',
      props: {
        endpointId: SystemRepository.Currency.qry,
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 3,
        mapping: [
          { from: 'recordId', to: 'currencyId' },
          { from: 'reference', to: 'currencyRef' },
          { from: 'name', to: 'currencyName' }
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
      name: 'currencyName',
      props: {
        readOnly: true
      }
    },

    {
      component: 'resourcecombobox',
      label: labels.dispersalType,
      name: 'dispersalType',
      props: {
        datasetId: DataSets.RT_Dispersal_Type,
        valueField: 'key',
        displayField: 'value',
        displayFieldWidth: 1,
        refresh: false,
        mapping: [
          { from: 'key', to: 'dispersalType' },
          { from: 'value', to: 'dispersalTypeName' }
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
    pId && getMonetaries(pId)
  }, [pId])

  const getMonetaries = pId => {
    const defaultParams = `_productId=${pId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.ProductMonetaries.qry,
      parameters: parameters
    }).then(res => {
      if (res?.list.length > 0)
        formik.setValues({
          currencies: res.list.map(({ ...rest }, index) => ({
            id: index,
            ...rest
          }))
        })

      const uniqueCurrencies = res.list.filter(
        (item, index, self) =>
          index === self.findIndex(t => t.currencyId === item.currencyId && t.countryId === item.countryId)
      )
      setStore(prevStore => ({
        ...prevStore,
        currencies: uniqueCurrencies
      }))
    })
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            name='rows'
            onChange={value => formik.setFieldValue('currencies', value)}
            value={formik.values.currencies}
            error={formik.errors.currencies}
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default ProductCurrenciesForm
