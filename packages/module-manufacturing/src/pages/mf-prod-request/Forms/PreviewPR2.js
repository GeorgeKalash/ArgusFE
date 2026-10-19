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
import { formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'

const PreviewPR2 = ({ requestId, parentFormik, onSelect, window }) => {
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

      const mappedRows = selectedRows.map(row => ({
        ...row, 
        itemId: row.recordId,
        sku: row.sku,
        itemName: row.name,
      }))

      onSelect(mappedRows)
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
      name: 'name',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.metal,
      name: 'metalRef',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemGroupRef,
      name: 'groupRef',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemGroupName,
      name: 'groupName',
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
      component: 'date',
      label: labels.createdDate,
      name: 'createdDate',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pcs',
      flex: 1,
      props: { 
        decimalScale: 2, 
        allowNegative: false ,
      },
      async onChange({ row: { update, newRow } }) {
        let qty = 0

        qty = newRow.itemWeight ? newRow.pcs * newRow.itemWeight : 0
        
        update({
          qty: qty
        })
      },
      propsReducer({ row, props }) {
        return {
          ...props,
          readOnly: !row.checked
        }
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      flex: 1,
      props: {
        decimalScale: 2,
        allowNegative: false,
        readOnly: true
      }
    }
  ]

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: ManufacturingRepository.ProductionRequest.preview2,
        parameters: `_requestId=${requestId}`
      })

      if (res?.list?.length > 0) {
        const selectedItems = parentFormik.values.items || []

        const selectedItemsMap = new Map(
          selectedItems.map(item => [item.itemId, item])
        )

        const rows = res.list.map((item, index) => {
          const selectedItem = selectedItemsMap.get(item.recordId)

          return {
            id: index + 1,
            ...item,
            checked: !!selectedItem,
            qty: selectedItem ? selectedItem.qty : item.qty,
            createdDate: item?.createdDate ? formatDateFromApi(item?.createdDate) : null
          }
        })

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
            enableFilters={true}
            allowDelete={false}
            allowAddNewLine={false}
            maxAccess={maxAccess}/>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default PreviewPR2