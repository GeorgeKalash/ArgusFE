import { useState, useEffect, useContext } from 'react'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { DataSets } from 'src/resources/DataSets'
import FormShell from 'src/components/Shared/FormShell'
import { ControlContext } from 'src/providers/ControlContext'
import toast from 'react-hot-toast'
import { CommonContext } from 'src/providers/CommonContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

const RetailForm = ({ store, labels, maxAccess }) => {
  const [data, setData] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [recordNum, setRecordsNum] = useState(0)

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
        } catch (error) {}
      }
      toast.success(platformLabels.Posted)
    }
  })

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
      try {
        const result = await getRecordsNum()
        setRecordsNum(result.length)
      } catch (error) {}
    }

    fetchAccessLevel()
  }, [])

  useEffect(() => {
    ;(async function () {
      if (store.recordId) {
        const response = await getRequest({
          extension: InventoryRepository.ItemRetail.qry,
          parameters: `&_itemId=${store.recordId}&_count=${recordNum}`
        })
        console.log(response, 'response')
      }
    })()
  }, [])

  const rowColumns = []

  return (
    <FormShell
      resourceId={ResourceIds.PostOutwards}
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
            rowId={['recordId']}
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
