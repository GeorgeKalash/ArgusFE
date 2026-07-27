import { useState, useEffect, useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import toast from 'react-hot-toast'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const RetailForm = ({ store, maxAccess }) => {
  const [data, setData] = useState([])
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  useEffect(() => {
    if (!store.packB || !store._retailSettings) return

    const initialData = store._retailSettings.map(item => ({
      key: item.key,
      value: item.value,
      checked: false
    }))

    const updatedData = initialData.map(row => {
      const match = (store.packB.itemRetailFlags ?? []).find(f => f.idx === parseInt(row.key))
      return match ? { ...row, checked: match.flag } : row
    })

    setData(updatedData)
  }, [store.packB, store._retailSettings])

  const rowColumns = [
    {
      field: 'value',
      flex: 1,
      headerName: ''
    }
  ]

  const handleSave = async () => {
    const flags = data.map(item => ({
      idx: parseInt(item.key),
      flag: item.checked
    }))

    const payload = {
      itemId: store.recordId,
      flags
    }

    await postRequest({
      extension: InventoryRepository.ItemRetail.set,
      record: JSON.stringify(payload)
    })
    toast.success(platformLabels.Updated)
  }

  return (
    <Form onSave={handleSave} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Table
            name='retail'
            columns={rowColumns}
            gridData={{ list: data }}
            rowId={['key']}
            pagination={false}
            maxAccess={maxAccess}
            showCheckboxColumn={true}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default RetailForm
