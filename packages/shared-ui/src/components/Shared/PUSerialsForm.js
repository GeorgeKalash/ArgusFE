import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Grid } from '@mui/material'
import ResourceComboBox from './ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useContext } from 'react'
import CustomNumberField from '../Inputs/CustomNumberField'
import { ResourceLookup } from './ResourceLookup'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { DataGrid } from './DataGrid'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import Form from './Form'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

export const PUSerialsForm = ({ row, siteId, window, updateRow, disabled }) => {
  const { platformLabels } = useContext(ControlContext)

  const { labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Serial
  })

  const conditions = {
    weight: row => !!row?.weight,
    srlNo: row => !!row?.srlNo
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  useSetWindow({ title: platformLabels.serials, window })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      sku: row?.sku,
      itemName: row?.itemName,
      itemId: row?.itemId,
      siteId,
      totalWeight: row?.qty || 0,
      items:
        row?.serials?.map((item, index) => ({
          ...item,
          id: index + 1
        })) || []
    },
    conditionSchema: ['items'],
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    onSubmit: async values => {
      const items = values.items.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))

      const serials = items.map(({ id, ...item }, index) => ({
        ...item,
        srlSeqNo: index + 1,
        srlNo: item.srlNo,
        seqNo: row.id
      }))

      updateRow({ changes: { serials } })

      window.close()
    }
  })

  const weightAssigned = formik.values.items.reduce((weightSum, row) => {
    const weightValue = parseFloat(row.weight) || 0

    return weightSum + weightValue
  }, 0)
  const balance = formik.values.totalWeight - weightAssigned || 0

  const columns = [
    {
      component: 'textfield',
      name: 'srlNo',
      label: labels.serialNo
    },
    {
      component: 'resourcecombobox',
      label: labels.size,
      name: 'sizeId',
      props: {
        endpointId: InventoryRepository.ItemSizes.qry,
        displayField: 'name',
        valueField: 'recordId',
        displayFieldWidth: 2,
        mapping: [
          { from: 'recordId', to: 'sizeId' },
          { from: 'reference', to: 'sizeRef' },
          { from: 'name', to: 'sizeName' }
        ],
        displayField: ['reference', 'name'],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'numberfield',
      name: 'weight',
      label: labels.weight,
      props: {
        mandatory: true
      }
    }
  ]

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} isSaved={false} actions={actions} maxAccess={maxAccess}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={labels?.sku}
                valueField='recordId'
                displayField='sku'
                valueShow='sku'
                secondValueShow='itemName'
                form={formik}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                label={labels.site}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='totalWeight'
                label={labels.totalWeight}
                maxAccess={maxAccess}
                value={formik.values.totalWeight}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='weightAssigned'
                label={labels.weightAssigned}
                maxAccess={maxAccess}
                value={weightAssigned}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='balanceWeight'
                label={labels.balanceWeight}
                maxAccess={maxAccess}
                value={balance}
                readOnly
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values?.items}
            error={formik.errors.items}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
            disabled={disabled}
            allowDelete={!disabled}
            allowAddNewLine={!disabled}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

PUSerialsForm.width = 500
PUSerialsForm.height = 700
