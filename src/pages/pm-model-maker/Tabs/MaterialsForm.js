import { useForm } from 'src/hooks/form'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { ProductModelingRepository } from 'src/repositories/ProductModelingRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Grid } from '@mui/material'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

export default function MaterialsForm({ store, labels, maxAccess }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId, isClosed } = store
  const editMode = !!recordId

  const { formik } = useForm({
    initialValues: {
      items: [{ id: 1 }]
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      items: yup
        .array()
        .of(
          yup.object().shape({
            itemId: yup.number().required(),
            pcs: yup.string().test(function (value) {
              const isAnyFieldFilled = this.parent.size
              if (this.options.from[1]?.value?.items?.length === 1) {
                if (isAnyFieldFilled && isAnyFieldFilled != 0) {
                  return !!value
                }

                return true
              }

              return !!value
            }),
            size: yup.string().test(function (value) {
              const isAnyFieldFilled = this.parent.pcs
              if (this.options.from[1]?.value?.items?.length === 1) {
                if (isAnyFieldFilled && isAnyFieldFilled != 0) {
                  return !!value
                }

                return true
              }

              return !!value
            })
          })
        )
        .required()
    }),
    onSubmit: async values => {
      const updatedRows = values?.items
        .map(({ id, itemCategoryName, rawCategoryName, itemCategoryRef, rawCategoryRef, ...itemDetails }, index) => {
          return {
            ...itemDetails,
            seqNo: index + 1
          }
        })
        .filter(item => item.pcs || item.size)

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
      displayFieldWidth: 2,
      props: {
        endpointId: InventoryRepository.UnfinishedGoods.snapshot,
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
        displayFieldWidth: 2
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
        maxLength: 7
      },
      updateOn: 'blur',
      onChange({ row: { update, newRow } }) {
        if (newRow.pcs > 32767) update({ pcs: 0 })
        else update({ pcs: newRow.pcs })
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
    <FormShell
      form={formik}
      resourceId={ResourceIds.Modelling}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
      isInfo={false}
      disabledSubmit={isClosed}
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
    </FormShell>
  )
}
