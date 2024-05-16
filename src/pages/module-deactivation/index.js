// ** React Imports
import { useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

// ** Helpers
import { useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import { DataSets } from 'src/resources/DataSets'
import toast from 'react-hot-toast'
import { CommonContext } from 'src/providers/CommonContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const ModuleDeactivation = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()
  const { getAllKvsByDataset } = useContext(CommonContext)

  //states
  const [moduleStore, setModuleStore] = useState([])

  const resModule = getAllKvsByDataset({
    _dataset: DataSets.MODULE,
    callback: setModuleStore
  })

  async function getGridData(options = {}) {
    const resCheckedModule = await getRequest({
      extension: AccessControlRepository.ModuleDeactivation.qry,
      parameters: `_filter=`
    })

    const finalList = moduleStore.map(x => {
      const n = {
        moduleId: x.key,
        moduleName: x.value,
        isInactive: false,
        checked: false
      }
      const matchingTemplate = resCheckedModule.list.find(y => n.moduleId == y.moduleId)

      // set n.isInactive=true if matchingTemplate is truthy.
      matchingTemplate && (n.isInactive = true)
      matchingTemplate && (n.checked = true)

      return n
    })

    return { list: finalList }
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: getGridData,
    datasetId: ResourceIds.ModuleDeactivation
  })

  const columns = [
    {
      field: 'moduleName',
      headerName: _labels.ModuleName,
      flex: 1
    }
  ]

  const ModuleDeactivationValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {},
    initialValues: {
      rows: [
        {
          moduleId: '',
          moduleName: '',
          isInactive: false,
          checked: false
        }
      ]
    },
    onSubmit: values => {
      postModule()
    }
  })

  const handleSubmit = () => {
    ModuleDeactivationValidation.handleSubmit()
  }

  const postModule = () => {
    // Filter out objects where checked is truthy

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

    postRequest({
      extension: AccessControlRepository.ModuleDeactivation.set2,
      record: JSON.stringify(resultObject)
    })
      .then(res => {
        toast.success('Record Generated Successfully')
      })
      .catch(error => {})
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['moduleId']}
          isLoading={false}
          maxAccess={access}
          showCheckboxColumn={true}
          pagination={false}
        />
      </Grow>
      <Fixed>
        <WindowToolbar isSaved={true} onSave={handleSubmit} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

export default ModuleDeactivation
