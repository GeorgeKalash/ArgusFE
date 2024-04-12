// ** React Imports
import { useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

// ** Helpers
import { useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataSets } from 'src/resources/DataSets'
import { CommonContext } from 'src/providers/CommonContext'
import { useFormik } from 'formik'

const SystemChecks = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()
  const { getAllKvsByDataset } = useContext(CommonContext)

  //states
  const [checkStore, setCheckStore] = useState([])

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {},
    initialValues: {
      rows: [
        {
          checkId: '',
          checkName: '',
          scope: '',
          masterId: '',
          value: false,
          checked: false
        }
      ]
    },
    onSubmit: values => {
      postChecks()
    }
  })

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: getGridData,
    datasetId: ResourceIds.SystemChecks
  })

  async function getGridData(options = {}) {
    console.log('enter initially')

    const resChecks = await getAllKvsByDataset({
      _dataset: DataSets.SYSTEM_CHECKS,
      callback: setCheckStore
    })

    const resCheckedSystems = await getRequest({
      extension: SystemRepository.SystemChecks.qry,
      parameters: `_scope=1`
    })

    const finalList = checkStore.map(x => {
      const n = {
        checkId: x.key,
        checkName: x.value,
        checked: false
      }
      const matchingTemplate = resCheckedSystems.list.find(y => n.checkId == y.checkId)

      matchingTemplate && (n.checked = true)

      return n
    })

    return { list: finalList }
  }

  const columns = [
    {
      field: 'checkId',
      headerName: _labels[1],
      flex: 1
    },
    {
      field: 'checkName',
      headerName: _labels[2],
      flex: 1
    }
  ]

  const postChecks = () => {
    const checkedObjects = data.list.filter(obj => obj.checked)
    checkedObjects.forEach(obj => {
      obj.scope = 1
      obj.masterId = 0
      obj.values = true
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
