import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form.js'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { Grid } from '@mui/material'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const SalesList = ({ store, labels, maxAccess, formikInitial }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)

  const conditions = {
    currencyId: row => row?.currencyId,
    plId: row => row?.plId,
    ptName: row => row?.ptName,
    value: row => row?.value || row?.value === 0,
    vtName: row => row?.vtName,
    minPrice: row =>
      (row.value > 0 || row?.plId > 0 || row?.ptName > 0 || row?.currencyId > 0) && row?.minPrice <= row?.value
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    initialValues: {
      defSaleMUId: store.measurementId || '',
      pgId: store.priceGroupId || '',
      returnPolicyId: store.returnPolicy || '',
      items: [
        {
          id: 1,
          itemId: store.recordId,
          currencyId: null,
          plId: null,
          priceType: '',
          muId: 0,
          valueType: '',
          value: null,
          minPrice: null
        }
      ]
    },
    conditionSchema: ['items'],
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const submissionData = {
        ...formikInitial,
        recordId,
        pgId: obj?.pgId || null,
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
          pgId: obj?.pgId || null,
          items: obj.items
            .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
            .map(item => ({
              ...item,
              itemId: recordId
            }))
        })
      })

      toast.success(platformLabels.Updated)
    }
  })

  const getItems = async recordId => {
    if (!recordId) return

    const response = await getRequest({
      extension: SaleRepository.Sales.qry,
      parameters: `&_itemId=${recordId}&_currencyId=${0}`
    })

    return response?.list?.length > 0
      ? response.list.map((item, index) => {
          return {
            ...item,
            id: index + 1
          }
        })
      : formik.values.items.map((row, index) => ({
          ...row,
          id: row.id ?? index
        }))
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const items = await getItems(recordId)
        formik.setValues({
          ...formik.values,
          items
        })
      }
    })()
  }, [recordId])

  useEffect(() => {
    formik.setFieldValue('defSaleMUId', store.measurementId || null)
    formik.setFieldValue('pgId', store.priceGroupId || null)
    formik.setFieldValue('returnPolicyId', store.returnPolicy || null)
  }, [store.measurementId, store.priceGroupId, store.returnPolicy])

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
      props: {
        allowNegative: false,
        maxLength: 17,
        decimalScale: 5
      }
    },
    {
      component: 'numberfield',
      label: labels.minPrice,
      name: 'minPrice',
      props: {
        allowNegative: false,
        maxLength: 12,
        decimalScale: 3
      }
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
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
            name='salesTable'
            initialValues={formik?.initialValues?.items?.[0]}
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default SalesList
