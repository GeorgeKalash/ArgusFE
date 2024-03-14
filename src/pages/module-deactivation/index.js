// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import { AuthContext } from 'src/providers/AuthContext'
import { DataSets } from 'src/resources/DataSets'
import { SystemRepository } from 'src/repositories/SystemRepository'

const ModuleDeactivation = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()

  //states
  const [errorMessage, setErrorMessage] = useState(null)
  const [selectedRows, setSelectedRows] = useState({})
  const { user } = useContext(AuthContext)

  async function getGridData(options = {}) {
    const languageId = user.languageId
    const datasetId = DataSets.MODULE

    const resModule = await getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: `_dataset=${datasetId}&_language=${languageId}`
    })

    const resCheckedModule = await getRequest({
      extension: AccessControlRepository.ModuleDeactivation.qry,
      parameters: `_filter=`
    })

    const finalList = resModule.list.map(x => {
      const n = {
        moduleId: x.key,
        moduleName: x.value,
        isInactive: false
      }
      const matchingTemplate = resCheckedModule.list.find(y => n.moduleId == y.moduleId)

      // set n.isInactive=true if matchingTemplate is truthy.
      matchingTemplate && (n.isInactive = true)

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
  console.log('dataa ', data)

  const columns = [
    {
      field: 'moduleName',
      headerName: _labels[2],
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
          isInactive: ''
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

  const handleCheckedRows = checkedRows => {
    setSelectedRows(prevSelectedRows => [...prevSelectedRows, ...checkedRows])
  }

  useEffect(() => {}, [selectedRows])

  const postModule = () => {
    // Filter out objects where checked is truthy
    const checkedObjects = data.list
      .filter(obj => obj.isInactive)
      .map(obj => {
        const { moduleName, ...rest } = obj

        return rest
      })

    const resultObject = {
      modules: checkedObjects
    }

    postRequest({
      extension: AccessControlRepository.ModuleDeactivation.set2,
      record: JSON.stringify(resultObject)
    })
      .then(res => {
        setSelectedRows([])
        toast.success('Record Generated Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    setSelectedRows([])
  }, [])

  return (
    <Box
      sx={{
        height: `${height - 80}px`
      }}
    >
      <CustomTabPanel index={0} value={0}>
        <Box sx={{ width: '100%' }}>
          <Table
            columns={columns}
            gridData={data}
            rowId={['moduleId']}
            isLoading={false}
            maxAccess={access}
            showCheckboxColumn={true}
            handleCheckedRows={handleCheckedRows}
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
          <WindowToolbar onSave={handleSubmit} smallBox={true} />
        </Box>
      </CustomTabPanel>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </Box>
  )
}

export default ModuleDeactivation
