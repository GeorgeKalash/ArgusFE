import { useState, useEffect, useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { useForm } from 'src/hooks/form'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import FormShell from 'src/components/Shared/FormShell'
import { DataSets } from 'src/resources/DataSets'
import { CommonContext } from 'src/providers/CommonContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import toast from 'react-hot-toast'
import { ResourceIds } from 'src/resources/ResourceIds'

const RetailForm = ({ store, maxAccess }) => {
  const [data, setData] = useState([])
  const [recordNum, setRecordsNum] = useState(0)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async values => {
      const checkedUserIds = data.filter(row => row.checked).map(row => row.recordId)
      if (checkedUserIds.length > 0) {
        try {
          await postRequest({
            extension: RemittanceOutwardsRepository.Postoutwards.post2,
            record: JSON.stringify({ ids: checkedUserIds })
          })
          toast.success(platformLabels.Posted)
        } catch (error) {}
      }
    }
  })

  // Fetch the keys/labels (getRecordsNum)
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

  // Fetch the first set of data (keys and labels)
  useEffect(() => {
    const fetchAccessLevel = async () => {
      try {
        const result = await getRecordsNum()
        setRecordsNum(result.length)

        // Set the data for the table with initial checked false
        const initialData = result.map(item => ({
          key: item.key,
          value: item.value,
          checked: false
        }))
        setData(initialData)
      } catch (error) {}
    }

    fetchAccessLevel()
  }, [])

  // Fetch the second set of data (flags) and merge with the first set
  useEffect(() => {
    if (store.recordId && recordNum > 0) {
      ;(async function () {
        const response = await getRequest({
          extension: InventoryRepository.ItemRetail.qry,
          parameters: `&_itemId=${store.recordId}&_count=${recordNum}`
        })

        // Update the data based on idx and flag
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
      flex: 1, // Make the column take the full width
      headerName: '' // Empty header to remove the label "Value"
    }

    // {
    //   field: 'checked',
    //   headerName: 'Checked',
    //   renderCell: params => (
    //     <input
    //       type='checkbox'
    //       checked={params.row.checked}
    //       onChange={e => {
    //         const updatedData = data.map(item =>
    //           item.key === params.row.key ? { ...item, checked: e.target.checked } : item
    //         )
    //         setData(updatedData)
    //       }}
    //     />
    //   )
    // }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.Items}
      form={formik}
      maxAccess
      isCleared={false}
      isSavedClear={false}
      infoVisible={false}
    >
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
      </VertLayout>
    </FormShell>
  )
}

export default RetailForm
