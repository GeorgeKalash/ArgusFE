import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { createConditionalSchema } from 'src/lib/validation'

export default function LineItemCapacityForm({ labels, access: maxAccess, obj }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { itemId, itemName, sku, classRef, className } = obj || {}

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.LineItemCapacity.page
  })

  const conditions = {
    lineId: row => row?.lineId > 0,
    fullCapacityWgtPerHr: row => row?.fullCapacityWgtPerHr,
    preparationHrs: row => row?.preparationHrs,
    nbOfLabors: row => row?.nbOfLabors
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'data')

  const { formik } = useForm({
    initialValues: {
      itemId: null,
      itemName: '',
      sku: '',
      class: '',
      data: [{ id: 1, lineId: null, fullCapacityWgtPerHr: 0, preparationHrs: 0, nbOfLabors: 0 }]
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
        displayFieldWidth: 1.5,
        mapping: [
          { from: 'recordId', to: 'lineId' },
          { from: 'name', to: 'lineName' },
          { from: 'reference', to: 'lineRef' }
        ],
        columnsInDropDown: [
          { key: 'name', value: 'Name' },
          { key: 'reference', value: 'Reference' }
        ]
      }
    },
    {
      component: 'numberfield',
      label: labels.fullCapacity,
      name: 'fullCapacityWgtPerHr',
      props: { decimalScale: 2, maxLength: 14 }
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
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Grid item xs={8}>
                <ResourceLookup
                  endpointId={InventoryRepository.Item.snapshot}
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

            // initialValues={formik.initialValues.data[0]}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
