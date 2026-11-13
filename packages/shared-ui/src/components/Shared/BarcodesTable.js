import { useContext, useEffect, useRef } from 'react'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

export default function BarcodesTable({ onSelect, window, initialSearch = '', onSearchChange }) {
  const { getRequest } = useContext(RequestsContext)
  const submittedRef = useRef(false)
  const { labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.BarcodesTable
  })
  useSetWindow({ title: labels.barcodes, window })

  const { formik } = useForm({
    initialValues: { rows: [] },
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
      flex: 1,
      type: 'number'
    },
    {
      field: 'scaleDescription', 
      headerName: labels.scaleDescription, 
      flex: 1
    },
    {
      field: 'posDescription', 
      headerName: labels.posDescription, 
      flex: 1
    }
  ]

  async function onSearch(qry) {
    onSearchChange?.(qry || '')

    if (!qry) return formik.setFieldValue('rows', [])

    const res = await getRequest({
      extension: InventoryRepository.Barcodes.snapshot,
      parameters: `_filter=${qry}`
    })

    formik.setFieldValue('rows', res?.list || [])
  }

  const onClear = () => {
    onSearchChange?.('')
    formik.setFieldValue('rows', [])
  }

  const selectRow = row => {
  if (!row || submittedRef.current) return

  submittedRef.current = true

  onSelect?.(row)
  window.close()
}

  useEffect(() => {
    if (initialSearch) onSearch(initialSearch)
  }, [])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          inputSearch
          autoFocus
          initialSearch={initialSearch}
          onSearch={onSearch}
          onSearchChange={term => onSearchChange?.(term || '')}
          onSearchClear={onClear}
          labels={labels}
          maxAccess={maxAccess}
        />
      </Fixed>
      <Grow>
        <Table
          name='barcodesLookup'
          columns={columns}
          gridData={{
            list: formik.values.rows,
            count: formik.values.rows.length
          }}
          rowId={['recordId']}
          pagination={false}
          onCellKeyDown={e => {
            if (e.event?.key === 'Enter' && e.data) {
              e.event.preventDefault()
              selectRow(e.data)
            }
          }}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

BarcodesTable.width = 900
BarcodesTable.height = 600