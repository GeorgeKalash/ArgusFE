import { useState, useContext, useEffect } from 'react'
import { Box } from '@mui/material'
import Table from 'src/components/Shared/Table'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import { DataSets } from 'src/resources/DataSets'
import toast from 'react-hot-toast'
import { CommonContext } from 'src/providers/CommonContext'

const ModuleDeactivation = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [data, setData] = useState([])

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.ModuleDeactivation
  })

  const handleSubmit = () => {
    postModule()
  }

  async function getAllModules() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.MODULE,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  useEffect(() => {
    ;(async function () {
      const moduleData = await getAllModules()

      const resCheckedModule = getRequest({
        extension: AccessControlRepository.ModuleDeactivation.qry,
        parameters: `_filter=`
      })

      Promise.all([resCheckedModule]).then(([systemModules]) => {
        const mergedModules = moduleData.map(moduleItem => {
          const item = {
            moduleId: moduleItem.key,
            moduleName: moduleItem.value,
            isInactive: false,
            checked: false
          }
          const matchingTemplate = systemModules.list.find(y => item.moduleId == y.moduleId)

          matchingTemplate && (item.isInactive = true)
          matchingTemplate && (item.checked = true)

          return item
        })
        setData({ list: mergedModules })
      })
    })()
  }, [])

  const columns = [
    {
      field: 'moduleName',
      headerName: _labels.ModuleName,
      flex: 1
    }
  ]

  const postModule = async () => {
    const checkedObjects = data.list
      .filter(obj => obj.checked)
      .map(obj => {
        const { moduleName, checked, ...rest } = obj

        return rest
      })
    checkedObjects.forEach(obj => {
      if (!obj.isIactive) {
        obj.isInactive = true
      }
    })

    const resultObject = {
      modules: checkedObjects
    }

    await postRequest({
      extension: AccessControlRepository.ModuleDeactivation.set2,
      record: JSON.stringify(resultObject)
    })
    toast.success('Record Updated Successfully')
  }

  return (
    <Box>
      <Table
        columns={columns}
        gridData={data}
        rowId={['moduleId']}
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

export default ModuleDeactivation
