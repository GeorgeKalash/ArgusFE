import { useContext, useRef } from 'react'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useError } from '@argus/shared-providers/src/providers/error'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'

export default function BarcodesLookup({ labels, maxAccess, onSelect, window }) {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const selectedRef = useRef(null)

  const { formik } = useForm({
    initialValues: { rows: [] },
    onSubmit: async () => {
      const selected = selectedRef.current

      if (!selected) {
        stackError({ message: platformLabels.checkItemsBeforeAppend })

        return
      }

      const { checked, ...row } = selected
      onSelect?.(row)
      window.close()
    }
  })

  const columns = [
    { 
      field: 'barcode', 
      headerName: labels.barcode, 
      flex: 1 
    },
    { 
      field: 'sku', 
      headerName: labels.sku, 
      flex: 1 
    },
    { 
      field: 'itemName', 
      headerName: labels.itemName, 
      flex: 1 
    },
    { 
      field: 'muName', 
      headerName: labels.msUnit, 
      flex: 1 
    },
    { 
      field: 'defaultQty', 
      headerName: labels.defaultQty, 
      flex: 1 
    }
  ]

  async function onSearch(qry) {
    selectedRef.current = null

    if (!qry) return formik.setFieldValue('rows', [])

    const res = await getRequest({
      extension: InventoryRepository.Barcodes.snapshot,
      parameters: `_filter=${qry}`
    })

    const rows = (res?.list || []).map(r => ({ ...r, checked: false }))
    formik.setFieldValue('rows', rows)
  }

  const onClear = () => {
    selectedRef.current = null
    formik.setFieldValue('rows', [])
  }

  const handleCheckboxChange = (row, isChecked) => {
    selectedRef.current = isChecked ? row : null
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} fullSize>
      <VertLayout>
        <Fixed>
          <GridToolbar
            inputSearch
            onSearch={onSearch}
            onSearchClear={onClear}
            labels={labels}
            maxAccess={maxAccess}
          />
        </Fixed>
        <Grow>
          <Table
            name='barcodesLookup'
            columns={columns}
            gridData={{ list: formik.values.rows, count: formik.values.rows.length }}
            rowId={['recordId']}
            pagination={false}
            showCheckboxColumn
            rowSelection='single'
            handleCheckboxChange={handleCheckboxChange}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}