import * as yup from 'yup'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'

export default function PRItemSize({ sizes, readOnly, onSave, window }) {
  const { labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.PRItemSize,
    editMode: true
  })

  useSetWindow({ title: labels.sizes, window });

  const emptyRow = { id: 1, sizeId: null, sizeRef: '', sizeName: '', pcs: 0, qty: 0 }

  const { formik } = useForm({
    maxAccess,
    validateOnChange: true,
    initialValues: {
      sizes: sizes?.length > 0 ? sizes.map((s, i) => ({ ...s, id: i + 1 })) : [emptyRow]
    },
    validationSchema: yup.object({
      sizes: yup.array().of(
        yup.object({
          sizeRef: yup.string().test(function (value) {
            if (this.options.from[1]?.value?.sizes?.length === 1) return true

            return !!value
          })
        })
      )
    }),
    onSubmit: async obj => {
      onSave(obj.sizes.filter(s => s.sizeId))
      window?.close()
    }
  })

  const total = field =>
    formik.values.sizes.reduce((sum, row) => sum + (parseFloat(row?.[field]) || 0), 0)

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sizeRef,
      name: 'sizeRef',
      props: {
        endpointId: InventoryRepository.ItemSizes.snapshot,
        displayField: 'reference',
        valueField: 'reference',
        minChars: 2,
        mapping: [
          { from: 'recordId', to: 'sizeId' },
          { from: 'reference', to: 'sizeRef' },
          { from: 'name', to: 'sizeName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      }
    },
    { component: 'textfield', label: labels.sizeName, name: 'sizeName', props: { readOnly: true } },
    { component: 'numberfield', label: labels.pcs, name: 'pcs', props: { maxLength: 9, decimalScale: 0, allowNegative: false } },
    { component: 'numberfield', label: labels.qty, name: 'qty', props: { maxLength: 10, decimalScale: 2, allowNegative: false } }
  ]

  return (
    <Form
      resourceId={ResourceIds.PRItemSize}
      onSave={formik.handleSubmit}
      maxAccess={maxAccess}
      disabledSubmit={readOnly}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('sizes', value)}
            value={formik.values.sizes}
            error={formik.errors.sizes}
            initialValues={emptyRow}
            columns={columns}
            name='sizes'
            maxAccess={maxAccess}
            disabled={readOnly}
            allowDelete={!readOnly}
            allowAddNewLine={!readOnly}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} p={1}>
            <Grid item xs={6}>
              <CustomNumberField name='totPcs' label={labels.totPcs} value={total('pcs')} readOnly maxAccess={maxAccess} />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField name='totQty' label={labels.totQty} value={total('qty')} readOnly maxAccess={maxAccess} />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </Form>
  )
}

PRItemSize.width = 700
PRItemSize.height = 450