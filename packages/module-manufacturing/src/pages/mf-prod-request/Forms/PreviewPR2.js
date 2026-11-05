import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useContext, useEffect, useRef } from 'react'
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
import ItemWindow from '@argus/shared-ui/src/components/Shared/ItemWindow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

const PreviewPR2 = ({ requestId, parentFormik, onSelect, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const rowsRef = useRef([])

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

      const mappedRows = selectedRows.map((row) => ({
        ...row,
        itemId: row.recordId,
        sku: row.sku,
        itemName: row.name,
        itemGroupName: row.groupName
      }))

      onSelect(mappedRows)
      window.close()
    }
  })

  rowsRef.current = formik.values.rows

  async function loadRows({ refresh = false } = {}) {
    const res = await getRequest({
      extension: ManufacturingRepository.ProductionRequest.preview2,
      parameters: `_requestId=${requestId}`
    })

    if (!res?.list?.length) return

    const selectedItemsMap = new Map((parentFormik.values.items || []).map(item => [item.itemId, item]))
    const currentRowsMap = new Map((rowsRef.current || []).map(row => [row.recordId, row]))

    const rows = res.list.map((item, index) => {
      const createdDate = item?.createdDate ? formatDateFromApi(item?.createdDate) : null
      const existing = refresh ? currentRowsMap.get(item.recordId) : null

      if (existing) {
        return {
          ...item,
          id: existing.id,
          checked: existing.checked,
          pcs: existing.pcs,
          qty: existing.qty,
          createdDate
        }
      }

      const selectedItem = selectedItemsMap.get(item.recordId)

      return {
        id: index + 1,
        ...item,
        checked: !!selectedItem,
        qty: selectedItem ? selectedItem.qty : item.qty,
        createdDate
      }
    })

    formik.setValues({ rows })
  }

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
      link: {
        enabled: true,
        popup: row =>
          stack({
            Component: ItemWindow,
            props: {
              obj: {
                recordId: row.itemId,
                ...row
              },
              onSuccess: () => loadRows({ refresh: true })
            },
            nextToTitle: row?.sku
          })
      },
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
      label: labels.itemGroupName,
      name: 'groupName',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.collection,
      name: 'collectionName',
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.category,
      name: 'categoryName',
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
    loadRows()
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
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default PreviewPR2