import { useContext, useEffect } from 'react'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import * as yup from 'yup'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { useError } from '@argus/shared-providers/src/providers/error'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

const GetJobOrdersForm = ({ labels, maxAccess, workCenterId, onAdd, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()

  const conditions = {
    waxPieces: row => ({
      optional: !row?.selected,
      valid: !row?.selected || (row.waxPieces > 0 && row.waxPieces <= row.pcs)
    })
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'jobOrders')

  const { formik } = useForm({
    maxAccess,
    conditionSchema: ['jobOrders'],
    initialValues: {
      jobOrders: [
        {
          id: 1,
          jobId: null,
          jobRef: '',
          sku: '',
          itemName: '',
          itemWeight: 0,
          qty: 0,
          pieces: 0,
          waxPieces: 0,
          selected: false
        }
      ]
    },
    validationSchema: yup.object({
      jobOrders: yup.array().of(schema)
    }),
    onSubmit: async values => {
      const selectedRows = values.jobOrders.filter(
        row => row.selected && Object.values(requiredFields)?.every(fn => fn(row))
      )

      if (!selectedRows.length) {
        stackError({
          message: platformLabels.checkItemsBeforeAppend
        })
        return
      }

      onAdd(selectedRows)
      window.close()
    }
  })

  const columns = [
    {
      component: 'checkbox',
      name: 'selected',
      label: ' ',
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.selected) {
          update({
            waxPieces: 0
          })
        }
      }
    },
    {
      component: 'image',
      name: 'imageUrl',
      label: labels.image,
      width: 30,
      clickable: true,
      titleField: 'reference'
    },
    {
      component: 'textfield',
      name: 'reference',
      label: labels.jobOrder,
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      name: 'sku',
      label: labels.sku,
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      name: 'itemName',
      label: labels.itemName,
      flex: 2,
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      name: 'itemWeight',
      label: labels.itemWeight,
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: labels.qty,
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      name: 'pcs',
      label: labels.pieces,
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      name: 'waxPieces',
      label: labels.waxPieces,
      props: {
        allowNegative: false
      },
      propsReducer({ row, props }) {
        return {
          ...props,
          readOnly: !row.selected,
          required: !!row.selected
        }
      }
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (!workCenterId) return

      const response = await getRequest({
        extension: ManufacturingRepository.MFJobOrder.qry3,
        parameters: `_workCenterId=${workCenterId}`
      })

      const data = response?.list?.length ? response.list.map((item, index) => ({
        ...item,
        id: index + 1,
        waxPieces: 0,
        selected: false
      })) : []

      formik.setValues({ jobOrders: data })
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('jobOrders', value)}
            value={formik.values.jobOrders}
            error={formik.errors.jobOrders}
            name='jobOrders'
            columns={columns}
            maxAccess={maxAccess}
            allowDelete={false}
            enableFilters
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default GetJobOrdersForm