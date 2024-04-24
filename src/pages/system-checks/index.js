import { useState, useContext, useEffect } from 'react'
import { Box } from '@mui/material'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataSets } from 'src/resources/DataSets'
import { CommonContext } from 'src/providers/CommonContext'
import useResourceParams from 'src/hooks/useResourceParams'

const SystemChecks = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [data, setData] = useState([])

  const { labels: _labels, access } = useResourceParams({
    datasetId: ResourceIds.SystemChecks
  })

  const handleSubmit = () => {
    postChecks()
  }

  async function getAllSystems() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.SYSTEM_CHECKS,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  useEffect(() => {
    ;(async function () {
      const systemCheckData = await getAllSystems()

      const resCheckedSystems = getRequest({
        extension: SystemRepository.SystemChecks.qry,
        parameters: `_scope=1`
      })

      Promise.all([resCheckedSystems]).then(([checkedSystems]) => {
        const mergedSYCheckedList = systemCheckData.map(systemCheckItem => {
          const item = {
            checkId: systemCheckItem.key,
            checkName: systemCheckItem.value,
            checked: false,
            value: false
          }
          const matchingTemplate = checkedSystems.list.find(y => item.checkId == y.checkId)
          matchingTemplate && (item.checked = true)
          matchingTemplate && (item.value = true)

          return item
        })

        setData({ list: mergedSYCheckedList })
      })
    })()
  }, [])

  const columns = [
    {
      field: 'checkId',
      headerName: _labels.checkId,
      flex: 1
    },
    {
      field: 'checkName',
      headerName: _labels.checkName,
      flex: 1
    }
  ]

  const postChecks = async () => {
    const checkedObjects = data.list.filter(obj => obj.checked)
    checkedObjects.forEach(obj => {
      obj.scope = 1
      obj.masterId = 0
      obj.value = true
    })

    const resultObject = {
      scope: 1,
      masterId: 0,
      items: checkedObjects
    }

    await postRequest({
      extension: SystemRepository.SystemChecks.set,
      record: JSON.stringify(resultObject)
    })
    toast.success('Record Updated Successfully')
  }

  return (
    <Box>
      <Table
        columns={columns}
        gridData={data}
        rowId={['checkId']}
        isLoading={false}
        maxAccess={access}
        showCheckboxColumn={true}
        handleCheckedRows={() => {}}
        pagination={false}
        addedHeight={'18px'}
      />
      <WindowToolbar isSaved={true} onSave={handleSubmit} smallBox={true} />
    </Box>
  )
}

export default SystemChecks
