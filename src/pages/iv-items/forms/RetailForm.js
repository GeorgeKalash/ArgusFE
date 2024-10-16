import { useState, useEffect, useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataSets } from 'src/resources/DataSets'
import { CommonContext } from 'src/providers/CommonContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import toast from 'react-hot-toast'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

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
          parameters: `&_itemId=${store.recordId}&_count=${recordNum}`
        })

        const updatedData = data.map(row => {
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
    <VertLayout>
      <Grow>
        <Table
          columns={rowColumns}
          gridData={{ list: data }}
          setData={setData}
          rowId={['key']}
          pageSize={50}
          pagination={false}
          paginationType='client'
          isLoading={false}
          maxAccess={maxAccess}
          showCheckboxColumn={true}
        />
      </Grow>
      <Fixed>
        <WindowToolbar onSave={handleSave} isSaved={true} />
      </Fixed>
    </VertLayout>
  )
}

export default RetailForm
