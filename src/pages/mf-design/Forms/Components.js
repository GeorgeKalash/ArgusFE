import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

const Components = ({ store, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    validateOnChange: true,
    maxAccess,
    initialValues: {
      designId: recordId,
      items: [
        {
          id: 1,
          designId: recordId,
          itemId: '',
          seqNo: 1,
          qty: 0,
          pcs: 0
        }
      ]
    },
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object({
          itemId: yup.string().test('required-if-filled', 'Item is required', function (value) {
            const { qty, pcs } = this.parent
            const index = this.options.index
            const isAnyFieldFilled = !!qty || !!pcs

            if (index === 0) {
              return !isAnyFieldFilled || !!value
            }

            return !!value
          }),

          qty: yup.string().test('required-if-filled', 'Qty is required and must be a number', function (value) {
            const { itemId, pcs } = this.parent
            const index = this.options.index
            const isAnyFieldFilled = !!itemId || !!pcs
            const numericValue = Number(value)

            if (index === 0) {
              return !isAnyFieldFilled || (!!value && !isNaN(numericValue))
            }

            return !!value && !isNaN(numericValue)
          }),

          pcs: yup
            .string()
            .test('required-if-filled', 'PCS is required and must be a number ≤ 2147483647', function (value) {
              const { itemId, qty } = this.parent
              const index = this.options.index
              const isAnyFieldFilled = !!itemId || !!qty
              const numericValue = Number(value)

              if (index === 0) {
                return !isAnyFieldFilled || (!!value && !isNaN(numericValue) && numericValue <= 2147483647)
              }

              return !!value && !isNaN(numericValue) && numericValue <= 2147483647
            })
        })
      )
    }),
    onSubmit: async values => {
      const modifiedItems = values.items
        .map((item, index) => ({
          ...item,
          seqNo: index + 1,
          id: index + 1
        }))
        .filter(item => item.itemId || item.qty || item.pcs)

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
            res.list.map(async (item, index) => {
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

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'itemId',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        displayField: 'sku',
        valueField: 'recordId',
        columnsInDropDown: [
          { key: 'sku', value: 'Sku' },
          { key: 'name', value: 'Name' }
        ],
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'name', to: 'itemName' },
          { from: 'sku', to: 'sku' }
        ],
        displayFieldWidth: 2
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
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default Components
