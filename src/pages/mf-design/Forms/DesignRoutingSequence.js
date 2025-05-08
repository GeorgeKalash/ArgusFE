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

const DesignRoutingSequence = ({ store, maxAccess, labels }) => {
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
          operationId: '',
          rmSeqNo: null,
          itemId: '',
          designQty: 0,
          designPcs: 0
        }
      ]
    },
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object({
          operationId: yup.string().test(function (value) {
            const isAnyFieldFilled = this.parent.designQty || this.parent.itemId
            if (this.options.from[1]?.value?.items?.length === 1) {
              if (isAnyFieldFilled && isAnyFieldFilled != 0) {
                return !!value
              }

              return true
            }

            return !!value
          }),
          itemId: yup.string().test(function (value) {
            const isAnyFieldFilled = this.parent.designQty || this.parent.operationId
            if (this.options.from[1]?.value?.items?.length === 1) {
              if (isAnyFieldFilled && isAnyFieldFilled != 0) {
                return !!value
              }

              return true
            }

            return !!value
          }),
          designQty: yup.string().test('check-value', 'Design Qty required', function (value) {
            const isFilled = !!this.parent.operationId || !!this.parent.itemId
            if (isFilled) {
              const numericValue = Number(value)

              if (!value || isNaN(numericValue)) {
                return false
              }
            }

            return true
          })
        })
      )
    }),
    onSubmit: async values => {
      const modifiedItems = values?.items
        .map((details, index) => {
          return {
            ...details,
            id: index + 1,
            rmSeqNo: index + 1,
            designId: recordId
          }
        })
        .filter(item => item.operationId || item.itemId || item.designQty)

      await postRequest({
        extension: ManufacturingRepository.DesignRawMaterial.set2,
        record: JSON.stringify({ designId: recordId, data: modifiedItems })
      }).then(() => {
        fetchGridData()
        toast.success(platformLabels.Edited)
      })
    }
  })

  const editMode = !!recordId

  async function fetchGridData() {
    const res = await getRequest({
      extension: ManufacturingRepository.DesignRawMaterial.qry,
      parameters: `_designId=${recordId}`
    })

    const updateItemsList =
      res?.list?.length !== 0
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
      component: 'resourcecombobox',
      label: labels.operation,
      name: 'operationId',
      props: {
        endpointId: ManufacturingRepository.Operation.qry,
        parameters: `_workCenterId=0&_startAt=0&_pageSize=1000&`,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'operationId' },
          { from: 'name', to: 'operationName' },
          { from: 'reference', to: 'operationRef' }
        ],
        columnsInDropDown: [
          { key: 'name', value: 'Name' },
          { key: 'reference', value: 'Reference' }
        ]
      }
    },
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
      label: labels.item,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'designQty',
      props: {
        decimalScale: 3,
        maxLength: 12
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'designPcs',
      props: {
        decimalScale: 0,
        maxLength: 10
      }
    }
  ]

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Designs}
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

export default DesignRoutingSequence
