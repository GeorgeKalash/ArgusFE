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

export default function LineItemCapacityForm({
  labels,
  maxAccess,
  itemId,
  itemName,
  sku,
  classId,
  classRef,
  className
}) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.LineItemCapacity.qry
  })

  const conditionalRequired = fieldName =>
    yup
      .string()
      .nullable()
      .test(`${fieldName}-required`, 'required', function (value) {
        const { data } = this.options.context || {}
        const rowIndex = this.options.index
        const row = data?.[rowIndex]

        const isFirstRow = Array.isArray(data) && rowIndex === 0

        const allEmpty = !row?.lineId && !row?.fullCapacityWgtPerHr && !row?.preparationHrs && !row?.nbOfLabors

        if (isFirstRow && allEmpty) {
          return true
        }

        return !!row?.[fieldName]
      })

  const { formik } = useForm({
    initialValues: {
      itemId,
      classId,
      itemName,
      sku,
      class: classRef ? `${classRef} ${className}` : '',
      data: [{ id: 1, lineId: null, fullCapacityWgtPerHr: 0, preparationHrs: 0, nbOfLabors: 0 }]
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      itemId: yup.number().required(),
      data: yup.array().of(
        yup.object().shape({
          lineId: conditionalRequired('lineId'),
          fullCapacityWgtPerHr: conditionalRequired('fullCapacityWgtPerHr'),
          preparationHrs: conditionalRequired('preparationHrs'),
          nbOfLabors: conditionalRequired('nbOfLabors')
        })
      )
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: ManufacturingRepository.LineItemCapacity.set2,
        record: JSON.stringify({
          ...obj,
          data: obj.data
            .filter(item => item.lineId)
            .map(({ id, lineName, lineRef, ...item }) => ({
              ...item,
              lineId: item.lineId || null,
              itemId: obj.itemId
            }))
        })
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  const editMode = !!itemId

  useEffect(() => {
    ;(async function () {
      if (itemId) {
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
      props: { decimalScale: 2 }
    },
    {
      component: 'numberfield',
      label: labels.startStopHrs,
      name: 'preparationHrs',
      props: { decimalScale: 2 }
    },

    {
      component: 'numberfield',
      label: labels.nbLabors,
      name: 'nbOfLabors',
      props: { decimalScale: 2 }
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.ExchangeRates}
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
                      formik.setFieldValue('classId', record?.classId)

                      if (record?.classId) {
                        formik.setFieldValue('class', `${record?.classRef} ${record?.className}`)
                      } else formik.setFieldValue('class', ``)
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
            name={'data'}
            maxAccess={maxAccess}
            initialValues={formik.initialValues.data[0]}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
