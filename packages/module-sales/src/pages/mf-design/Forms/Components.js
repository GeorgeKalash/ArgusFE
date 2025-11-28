import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { getFormattedNumber } from '@argus/shared-domain/src/lib/numberField-helper'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

const Components = ({ store, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const conditions = {
    itemId: row => row?.itemId,
    qty: row => row?.qty != null,
    pcs: row => row?.pcs != null && row?.pcs <= 2147483647
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    validateOnChange: true,
    maxAccess,
    conditionSchema: ['items'],
    initialValues: {
      designId: recordId,
      items: [
        {
          id: 1,
          designId: recordId,
          itemId: '',
          seqNo: 1,
          qty: null,
          pcs: null
        }
      ]
    },
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    onSubmit: async values => {
      const modifiedItems = values.items
        .map((item, index) => ({
          ...item,
          seqNo: index + 1,
          id: index + 1
        }))
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))

      await postRequest({
        extension: ManufacturingRepository.Components.set2,
        record: JSON.stringify({ designId: recordId, items: modifiedItems })
      }).then(() => {
        fetchGridData()
        toast.success(platformLabels.Edited)
      })
    }
  })

  const editMode = !!recordId

  async function fetchGridData() {
    const res = await getRequest({
      extension: ManufacturingRepository.Components.qry,
      parameters: `_designId=${recordId}`
    })

    const updateItemsList =
      res?.list?.length != 0
        ? await Promise.all(
            res?.list?.map(async (item, index) => {
              return {
                ...item,
                id: index + 1
              }
            })
          )
        : formik.initialValues.items

    formik.setValues({
      designId: recordId,
      recordId,
      items: updateItemsList
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) await fetchGridData()
    })()
  }, [])

  const totalQty = formik.values.items.reduce((qty, row) => qty + (Number(row.qty) || 0), 0)
  const totalPcs = formik.values.items.reduce((pcs, row) => pcs + (Number(row.pcs) || 0), 0)

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'itemId',
      props: {
        endpointId: InventoryRepository.Item.snapshot4,
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
          { from: 'categoryName', to: 'categoryName' }
        ],
        displayFieldWidth: 2
      },
      async onChange({ row: { update, newRow } }) {
        if (newRow?.itemId) {
          const res = await getRequest({
            extension: InventoryRepository.ItemProduction.get,
            parameters: `_recordId=${newRow.itemId}`
          })
          update({ rmCategoryName: res?.record?.rmcName || '' })
        } else {
          update({ rmCategoryName: '' })
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
      name: 'categoryName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.rmCategory,
      name: 'rmCategoryName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      props: {
        decimalScale: 3,
        maxLength: 12
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pcs',
      props: {
        decimalScale: 0,
        maxLength: 10
      }
    }
  ]

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Design}
      maxAccess={maxAccess}
      isCleared={false}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            maxAccess={maxAccess}
          />
        </Grow>
        <Fixed>
          <Grid container direction='row' wrap='nowrap' sx={{ pt: 5, justifyContent: 'flex-end' }}>
            <Grid item xs={3} sx={{ pl: 3 }}>
              <CustomTextField
                name='totalQty'
                maxAccess={maxAccess}
                value={getFormattedNumber(totalQty)}
                label={labels.totalQty}
                readOnly={true}
              />
            </Grid>
            <Grid item xs={3} sx={{ pl: 3 }}>
              <CustomTextField
                name='totalPcs'
                maxAccess={maxAccess}
                value={getFormattedNumber(totalPcs.toFixed(2))}
                label={labels.totalPcs}
                readOnly={true}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default Components
