import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { useError } from '@argus/shared-providers/src/providers/error'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

const PreviewPR = ({ type, plantId, onSelect, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const { labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.PreviewPR
  })

    const conditions = {
    qty: row => ({
      optional: !row?.checked,
      valid: !row?.checked || row.qty != null
    })
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'rows')

  const { formik } = useForm({
    validationSchema: yup.object({
      rows: yup.array().of(schema)
    }),
    conditionSchema: ['rows'],
    initialValues: {
      rows: []
    },
    onSubmit: async values => {
      const selectedRows = values.rows.filter(
        row => row.checked && Object.values(requiredFields)?.every(fn => fn(row))
      )

      if (!selectedRows.length) {
        stackError({
          message: platformLabels.checkItemsBeforeAppend
        })
        return
      }

      onSelect(selectedRows)
      window.close()
    }
  })

  const columns = [
    {
      component: 'checkbox',
      label: ' ',
      name: 'checked',
      flex: 0.5,
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.selected) {
          update({
            qty: 0
          })
        }
      }
    },
    {
      component: 'textfield',
      label: labels.sku,
      name: 'sku',
      flex: 1,
      props: { 
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      flex: 1,
      props: { 
        readOnly: true 
      }
    },
    {
      component: 'textfield',
      label: labels.metalRef,
      name: 'metalRef',
      flex: 1,
      props: {
        readOnly: true 
      }
    },
    {
      component: 'textfield',
      label: labels.itemGroupRef,
      name: 'itemGroupRef',
      flex: 1,
      props: { 
        readOnly: true 
      }
    },
    {
      component: 'textfield',
      label: labels.itemGroupName,
      name: 'itemGroupName',
      flex: 1,
      props: { 
        readOnly: true 
      }
    },
    {
      component: 'textfield',
      label: labels.weight,
      name: 'itemWeight',
      flex: 1,
      props: {
        readOnly: true 
      }
    },
    {
      component: 'numberfield',
      label: labels.st_qty,
      name: 'st_qty',
      flex: 1,
      props: { 
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.lt_qty,
      name: 'lt_qty',
      flex: 1,
      props: { 
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      flex: 1,
      props: { 
        decimalScale: 2, 
        allowNegative: false 
      },
      propsReducer({ row, props }) {
        return {
          ...props,
          readOnly: !row.checked
        }
      }
    }
  ]

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: ManufacturingRepository.ProductionRequest.preview,
        parameters: type === 1 ? `_plantId=${plantId}` : ''
      })

      if (res?.list?.length > 0) {
        const rows = res.list.map((item, index) => ({
          id: index + 1,
          checked: false,
          ...item
        }))
        formik.setValues({ rows })
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} fullSize>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values.rows}
            error={formik.errors.rows}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default PreviewPR