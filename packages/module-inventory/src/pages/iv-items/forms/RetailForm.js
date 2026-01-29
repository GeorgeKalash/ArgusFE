import { useState, useEffect, useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { CommonContext } from '@argus/shared-providers/src/providers/CommonContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import toast from 'react-hot-toast'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const RetailForm = ({ store, maxAccess }) => {
  const [data, setData] = useState([])
  const [recordNum, setRecordsNum] = useState(0)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  const getRecordsNum = () => {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.IV_ITEM_RETAIL_SETTINGS,
        callback: result => {
          if (result) resolve(result)
          else reject(new Error('Failed to retrieve access level'))
        }
      })
    })
  }

  useEffect(() => {
    const fetchAccessLevel = async () => {
      const result = await getRecordsNum()
      setRecordsNum(result.length)

      const initialData = result.map(item => ({
        key: item.key,
        value: item.value,
        checked: false
      }))
      setData(initialData)
    }

    fetchAccessLevel()
  }, [])

  useEffect(() => {
    if (store.recordId && recordNum > 0) {
      ;(async function () {
        const response = await getRequest({
          extension: InventoryRepository.ItemRetail.qry,
          parameters: `_itemId=${store.recordId}&_count=${recordNum}`
        })

        const updatedData = data?.map(row => {
          const match = response.list.find(item => item.idx === parseInt(row.key))

          return match ? { ...row, checked: match.flag } : row
        })

        setData(updatedData)
      })()
    }
  }, [store.recordId, recordNum])

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
            pageSize={50}
            pagination={false}
            paginationType='client'
            isLoading={false}
            maxAccess={maxAccess}
            showCheckboxColumn={true}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default RetailForm
