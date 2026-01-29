import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

export default function ItemReplacementForm({ labels, maxAccess, recordId }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Replacement.page
  })

  const conditions = {
    replacementId: row => row?.replacementId > 0
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    initialValues: {
      recordId,
      itemId: null,
      sku: '',
      itemName: '',
      items: []
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      itemId: yup.string().required(),
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const resultObject = {
        itemId: obj.itemId,
        items: obj.items.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
      }

      const res = await postRequest({
        extension: InventoryRepository.Replacement.set2,
        record: JSON.stringify(resultObject)
      })
      toast.success(platformLabels.Updated)
      await refetchForm(res?.recordId)
      formik.setFieldValue('recordId', res?.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  async function refetchForm(recordId) {
    if (recordId) {
      const res = await getRequest({
        extension: InventoryRepository.Item.get,
        parameters: `_recordId=${recordId}`
      })

      const res2 = await getRequest({
        extension: InventoryRepository.Replacement.qry,
        parameters: `_itemId=${recordId}`
      })

      formik.setValues({
        sku: res?.record?.sku,
        itemId: recordId,
        itemName: res?.record?.name,
        items:
          res2?.list?.length > 0
            ? res2?.list?.map((item, index) => ({
                ...item,
                id: index + 1
              }))
            : [
                {
                  id: 1
                }
              ]
      })
    }
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await refetchForm(recordId)
        formik.setFieldValue('recordId', recordId)
      }
    })()
  }, [recordId])

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.replacementSKU,
      name: 'replacementSKU',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        parameters: { _categoryId: 0, _msId: 0, _startAt: 0, _size: 1000 },
        displayField: 'sku',
        valueField: 'sku',
        mapping: [
          { from: 'recordId', to: 'replacementId' },
          { from: 'sku', to: 'replacementSKU' },
          { from: 'name', to: 'replacementItemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Item Name' }
        ],
        displayFieldWidth: 3,
        minChars: 2
      }
    },
    {
      component: 'textfield',
      label: labels.replacementItemName,
      flex: 2,
      name: 'replacementItemName',
      props: {
        readOnly: true
      }
    }
  ]

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.ItemReplacement}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={labels.sku}
                valueField='reference'
                displayField='name'
                valueShow='sku'
                required
                secondValueShow='itemName'
                formObject={formik.values}
                form={formik}
                columnsInDropDown={[
                  { key: 'sku', value: 'SKU' },
                  { key: 'name', value: 'Name', grid: 6 }
                ]}
                onChange={(event, newValue) => {
                  refetchForm(newValue?.recordId || null)
                }}
                secondFieldName={'itemName'}
                onSecondValueChange={value => {
                  formik.setFieldValue('itemName', value)
                }}
                errorCheck={'itemId'}
                maxAccess={maxAccess}
                readOnly={editMode}
                displayFieldWidth={3}
                firstFieldWidth={4}
              />
            </Grid>
          </Grid>

          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            initialValues={formik.initialValues.items[0]}
            maxAccess={maxAccess}
            disabled={!formik.values.itemId}
            allowAddNewLine={!!formik.values.itemId}
            allowDelete={!!formik.values.itemId}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
