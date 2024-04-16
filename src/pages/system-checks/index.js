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

  //states
  const [checkStore, setCheckStore] = useState([])
  const [data, setData] = useState([])

  const { labels: _labels, access } = useResourceParams({
    datasetId: ResourceIds.SystemChecks
  })

  const handleSubmit = () => {
    postChecks()
  }

  function getAllSystems() {
    getAllKvsByDataset({
      _dataset: DataSets.SYSTEM_CHECKS,
      callback: setCheckStore
    })
  }

  useEffect(() => {
    if (checkStore) {
      const resCheckedSystems = getRequest({
        extension: SystemRepository.SystemChecks.qry,
        parameters: `_scope=1`
      })

      Promise.all([resCheckedSystems]).then(([checkedSystems]) => {
        const mergedSYCheckedList = checkStore.map(x => {
          const item = {
            checkId: x.key,
            checkName: x.value,
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkStore])

  useEffect(() => {
    getAllSystems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const postChecks = () => {
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

    postRequest({
      extension: SystemRepository.SystemChecks.set,
      record: JSON.stringify(resultObject)
    })
      .then(res => {
        toast.success('Record Updated Successfully')
      })
      .catch(error => {})
  }

  return (
    <Box
      sx={{
        height: `${height - 80}px`
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Table
          columns={columns}
          gridData={data}
          rowId={['checkId']}
          isLoading={false}
          maxAccess={access}
          showCheckboxColumn={true}
          handleCheckedRows={() => {}}
          pagination={false}
        />
      </Box>
      <Box
        sx={{
          position: 'fixed',
          bottom: -20,
          left: 0,
          width: '100%',
          margin: 0
        }}
      >
        <WindowToolbar isSaved={true} onSave={handleSubmit} smallBox={true} />
      </Box>
    </Box>
  )
}

export default SystemChecks
