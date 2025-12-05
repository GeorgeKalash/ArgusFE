import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ProductModelingRepository } from '@argus/repositories/src/repositories/ProductModelingRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { Grid } from '@mui/material'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function MaterialsForm({ store, labels, maxAccess }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId, isClosed } = store
  const editMode = !!recordId

  const conditions = {
    itemId: row => row?.itemId,
    size: row => row?.size,
    pcs: row => row?.pcs < 32767
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    initialValues: {
      items: [{ id: 1 }]
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    onSubmit: async values => {
      const updatedRows = values?.items
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map(({ id, itemCategoryName, rawCategoryName, itemCategoryRef, rawCategoryRef, ...itemDetails }, index) => {
          return {
            ...itemDetails,
            seqNo: index + 1
          }
        })

      await postRequest({
        extension: ProductModelingRepository.ModellingMaterial.set2,
        record: JSON.stringify({ modelId: recordId, items: updatedRows })
      })

      toast.success(platformLabels.Edited)
    }
  })

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'itemId',
      props: {
        endpointId: InventoryRepository.Materials.snapshot,
        displayField: 'sku',
        valueField: 'recordId',
        columnsInDropDown: [
          { key: 'sku', value: 'Sku' },
          { key: 'name', value: 'Name' }
        ],
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'name', to: 'itemName' },
          { from: 'sku', to: 'sku' },
          { from: 'categoryName', to: 'itemCategoryName' }
        ],
        displayFieldWidth: 3
      },
      async onChange({ row: { update, newRow } }) {
        if (newRow.itemId) {
          const { record } = await getRequest({
            extension: InventoryRepository.ItemProduction.get,
            parameters: `_recordId=${newRow.itemId}`
          })
          update({ rawCategoryName: record?.rmcName })
        }
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.category,
      name: 'itemCategoryName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.rawCategory,
      name: 'rawCategoryName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pcs',
      props: {
        maxLength: 7,
        decimalScale: 0
      }
    },
    {
      component: 'textfield',
      label: labels.size,
      name: 'size',
      props: {
        maxLength: 10
      }
    },
    {
      component: 'numberfield',
      label: labels.weight,
      name: 'weight',
      props: {
        maxLength: 10,
        decimalScale: 2
      }
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: ProductModelingRepository.ModellingMaterial.qry,
          parameters: `_modelId=${recordId}`
        })

        if (res?.list.length > 0) {
          const updateItemsList = res?.list?.map((item, index) => ({
            ...item,
            id: index + 1
          }))

          formik.setFieldValue('items', updateItemsList)
        }
      }
    })()
  }, [])

  const totalPcs = formik.values.items.reduce((sum, row) => {
    const value = parseFloat(row?.pcs?.toString().replace(/,/g, '')) || 0

    return sum + value
  }, 0)

  const totalWgt = formik.values.items.reduce((sum, row) => {
    const Value = parseFloat(row?.weight?.toString().replace(/,/g, '')) || 0

    return sum + Value
  }, 0)

  return (
    <Form
      onSave={formik.handleSubmit}
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={isClosed}
      isParentWindow={false}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            name='materials'
            maxAccess={maxAccess}
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values?.items}
            error={formik.errors?.items}
            columns={columns}
            allowDelete={!isClosed}
            disabled={isClosed}
          />
        </Grow>
        <Fixed>
          <Grid container justifyContent='flex-end' spacing={2}>
            <Grid item xs={3}>
              <CustomNumberField
                name='totalPcs'
                maxAccess={maxAccess}
                label={labels.totalPcs}
                value={totalPcs}
                readOnly
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='totalWgt'
                maxAccess={maxAccess}
                label={labels.totalWgt}
                value={totalWgt}
                readOnly
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </Form>
  )
}
