import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

export default function LineItemCapacityForm({ labels, access: maxAccess, obj }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { itemId, itemName, sku, classRef, className } = obj || {}

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.LineItemCapacity.page
  })

  const conditions = {
    lineId: row => row?.lineId > 0,
    fullCapacityWgtPerHr: row => row?.fullCapacityWgtPerHr != null,
    preparationHrs: row => row?.preparationHrs != null,
    nbOfLabors: row => row?.nbOfLabors != null
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'data')

  const { formik } = useForm({
    initialValues: {
      itemId: null,
      itemName: '',
      sku: '',
      class: '',
      data: [{ id: 1, lineId: null, fullCapacityWgtPerHr: null, preparationHrs: null, nbOfLabors: null }]
    },
    maxAccess,
    conditionSchema: ['data'],
    validateOnChange: true,
    validationSchema: yup.object({
      itemId: yup.number().required(),
      data: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: ManufacturingRepository.LineItemCapacity.set2,
        record: JSON.stringify({
          ...obj,
          data: obj.data
            .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
            .map(({ id, lineName, lineRef, ...item }) => ({
              ...item,
              lineId: item.lineId || null,
              itemId: obj.itemId
            }))
        })
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)

      invalidate()
    }
  })

  const editMode = !!itemId

  useEffect(() => {
    ;(async function () {
      if (itemId) {
        formik.setFieldValue('itemId', itemId)
        formik.setFieldValue('itemName', itemName)
        formik.setFieldValue('sku', sku)
        formik.setFieldTouched('class', classRef ? `${classRef} ${className}` : '')

        const { list } = await getRequest({
          extension: ManufacturingRepository.LineItemCapacity.qry,
          parameters: `_params=1|${itemId}`
        })

        formik.setFieldValue(
          'data',
          list?.map((item, index) => ({
            id: index + 1,
            ...item
          }))
        )
      }
    })()
  }, [])

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.line,
      name: 'lineId',
      props: {
        endpointId: ManufacturingRepository.ProductionLine.qry,
        displayField: 'reference',
        valueField: 'recordId',
        displayFieldWidth: 2,
        mapping: [
          { from: 'recordId', to: 'lineId' },
          { from: 'name', to: 'lineName' },
          { from: 'reference', to: 'lineRef' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'numberfield',
      label: labels.fullCapacity,
      name: 'fullCapacityWgtPerHr',
      props: { decimalScale: 2, maxLength: 9 }
    },
    {
      component: 'numberfield',
      label: labels.startStopHrs,
      name: 'preparationHrs',
      props: { decimalScale: 2, maxLength: 5 }
    },

    {
      component: 'numberfield',
      label: labels.nbLabors,
      name: 'nbOfLabors',
      props: { decimalScale: 0, maxLength: 4 }
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.LineItemCapacity}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isInfo={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid item xs={8}>
                <ResourceLookup
                  endpointId={InventoryRepository.Item.snapshot}
                  parameters={{ _size: 30, _startAt: 0, _categoryId: 0, _msId: 0 }}
                  name='itemId'
                  label={labels.sku}
                  valueField='sku'
                  displayField='name'
                  readOnly={editMode}
                  valueShow='sku'
                  secondValueShow='itemName'
                  form={formik}
                  required
                  displayFieldWidth={2}
                  columnsInDropDown={[
                    { key: 'sku', value: 'SKU' },
                    { key: 'name', value: 'Name' }
                  ]}
                  onChange={async (event, newValue) => {
                    formik.setFieldValue('itemId', newValue?.recordId || null)
                    formik.setFieldValue('itemName', newValue?.name || '')
                    formik.setFieldValue('sku', newValue?.sku || '')
                    if (newValue?.recordId) {
                      const { record } = await getRequest({
                        extension: InventoryRepository.ItemProduction.get,
                        parameters: `_recordId=${newValue?.recordId}`
                      })

                      formik.setFieldValue('class', record?.classId ? `${record?.classRef} ${record?.className}` : '')
                    }
                  }}
                  errorCheck={'itemId'}
                  maxAccess={maxAccess}
                />
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <CustomTextField name='class' label={labels.prodClass} readOnly value={formik.values.class} />
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('data', value)}
            columns={columns}
            value={formik.values.data}
            error={formik.errors.data}
            name='data'
            maxAccess={maxAccess}
            initialValues={formik.initialValues.data[0]}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
