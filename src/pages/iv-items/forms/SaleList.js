import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { useForm } from 'src/hooks/form.js'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Grid } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataSets } from 'src/resources/DataSets'
import { createConditionalSchema } from 'src/lib/validation'

const SalesList = ({ store, labels, maxAccess, formikInitial }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store

  const { platformLabels } = useContext(ControlContext)

  const conditions = {
    currencyId: row => row?.currencyId,
    plId: row => row?.plId,
    ptName: row => row?.ptName,
    value: row => row?.value,
    vtName: row => row?.vtName,
    minPrice: row => row?.minPrice <= row?.value
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    initialValues: {
      defSaleMUId: store.measurementId || '',
      pgId: store.priceGroupId || '',
      returnPolicyId: store.returnPolicy || '',
      items: [
        {
          itemId: store.recordId,
          currencyId: null,
          plId: null,
          priceType: '',
          muId: 0,
          valueType: '',
          value: '',
          priceWithVat: '',
          minPrice: ''
        }
      ]
    },
    conditionSchema: ['items'],
    validationSchema: yup.object({
      items: yup.array().of(schema),

      // items: yup.array().of(
      //   yup.object().shape({
      //     currencyId: yup.number().required(),
      //     plId: yup.number().required(),
      //     ptName: yup.string().required(),
      //     value: yup.number().required().typeError(),
      //     vtName: yup.string().required(),
      //     minPrice: yup
      //       .number()
      //       .nullable()
      //       .test(function (value) {
      //         const { value: price } = this.parent

      //         return value == null || price == null || value <= price
      //       })
      //   })
      // )
    }),
    validateOnChange: true,
    onSubmit: async obj => {
      const submissionData = {
        ...formikInitial,
        recordId,
        defSaleMUId: formik.values.defSaleMUId,
        returnPolicyId: formik.values.returnPolicyId
      }

      await postRequest({
        extension: InventoryRepository.Items.set,
        record: JSON.stringify(submissionData)
      })

      await postRequest({
        extension: SaleRepository.Sales.set2,
        record: JSON.stringify({
          itemId: recordId,
          items: obj.items.filter(row => Object.values(requiredFields)?.every(fn => fn(row))).map(item => ({
            ...item,
            itemId: recordId
          }))
        })
      })

      toast.success(platformLabels.Updated)
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SaleRepository.Sales.qry,
          parameters: `&_itemId=${recordId}&_currencyId=${0}`
        })

        const modifiedList = res?.list?.map((item, index) => ({
          ...item,
          id: index + 1
        }))

        formik.setFieldValue('items', modifiedList)
      }
    })()
  }, [recordId])

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.priceLevel,
      name: 'plId',
      props: {
        endpointId: SaleRepository.PriceLevel.qry,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'plId' },
          { from: 'reference', to: 'plRef' },
          { from: 'name', to: 'plName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.measure,
      name: 'muId',
      props: {
        endpointId: InventoryRepository.MeasurementUnit.qry,
        parameters: `_msId=${store._msId}`,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'muId' },
          { from: 'reference', to: 'muRef' },
          { from: 'name', to: 'muName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.currency,
      name: 'currencyId',
      props: {
        endpointId: SystemRepository.Currency.qry,
        parameters: `_msId=${store._msId}&_filter=`,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'currencyId' },
          { from: 'reference', to: 'currencyRef' },
          { from: 'name', to: 'currencyName' }
        ]
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.priceType,
      name: 'ptName',
      props: {
        endpointId: InventoryRepository.Items.pack,
        valueField: 'recordId',
        valueField: 'key',
        displayField: 'value',
        displayFieldWidth: 2,
        mapping: [
          { from: 'key', to: 'priceType' },
          { from: 'value', to: 'ptName' }
        ],
        reducer: res => {
          const formattedPriceTypes = res?.record?.priceTypes.map(priceTypes => ({
            key: parseInt(priceTypes.key),
            value: priceTypes.value
          }))

          return formattedPriceTypes
        }
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.valueType,
      name: 'vtName',
      props: {
        datasetId: DataSets.VALUE_TYPE,
        valueField: 'key',
        displayField: 'value',
        displayFieldWidth: 2,
        mapping: [
          { from: 'key', to: 'valueType' },
          { from: 'value', to: 'vtName' }
        ]
      }
    },
    {
      component: 'numberfield',
      label: labels.price,
      name: 'value',
      maxLength: 17,
      decimalScal: 3
    },
    {
      component: 'numberfield',
      label: labels.minPrice,
      name: 'minPrice',
      maxLength: 17,
      decimalScal: 3
    }
  ]

  return (
    <FormShell form={formik} resourceId={ResourceIds.Items} maxAccess={maxAccess} infoVisible={false} isCleared={false}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={store._msId ? InventoryRepository.MeasurementUnit.qry : ''}
                parameters={`_msId=${store._msId}`}
                name='defSaleMUId'
                label={labels.measure}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('defSaleMUId', newValue?.recordId || '')
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SaleRepository.PriceGroups.qry}
                name='pgId'
                label={labels.priceGroups}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('pgId', newValue?.recordId || '')
                }}
                onClear={() => formik.setFieldValue('pgId', '')}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SaleRepository.ReturnPolicy.qry}
                name='returnPolicyId'
                label={labels.returnPolicy}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('returnPolicyId', newValue?.recordId || '')
                }}
                onClear={() => formik.setFieldValue('returnPolicyId', '')}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values?.items}
            error={formik.errors?.items}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SalesList
