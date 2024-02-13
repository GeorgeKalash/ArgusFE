// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'

const ProductionRequestLog = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()

  //states
  const [errorMessage, setErrorMessage] = useState(null)
  const [selectedRows, setSelectedRows] = useState({})

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {},
    initialValues: {
      rows: [{}]
    },
    onSubmit: values => {
      calculateLeans()
    }
  })

  async function getGridData() {
    const parameters = '_status=1&_filter='

    return await getRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.preview,
      parameters: parameters
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: getGridData,
    endpointId: ManufacturingRepository.LeanProductionPlanning.preview,
    datasetId: ResourceIds.ProductionRequestLog
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.LeanProductionPlanning.preview
  })

  const columns = [
    {
      field: 'className',
      headerName: _labels[2],
      flex: 1
    },
    {
      field: 'sku',
      headerName: _labels[3],
      flex: 1
    },
    {
      field: 'thickness',
      headerName: _labels[4],
      flex: 1
    },
    {
      field: 'width',
      headerName: _labels[5],
      flex: 1
    },
    {
      field: 'quantity',
      headerName: _labels[6],
      flex: 1
    },
    {
      field: 'totalThickness',
      headerName: _labels[7],
      flex: 1
    }
  ]

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  const handleCheckedRows = checkedRows => {
    setSelectedRows(prevSelectedRows => [...prevSelectedRows, ...checkedRows])
  }

  useEffect(() => {}, [selectedRows])

  const calculateLeans = () => {
    const checkedObjects = selectedRows.filter(obj => obj.checked)

    /* postRequest({
        extension: ManufacturingRepository.ProductionRequestLog.set,
        record: JSON.stringify(obj)
      })
        .then(res => {
          toast.success('Record Updated Successfully')
        })
        .catch(error => {
          setErrorMessage(error)
        })*/
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
            rowId={['recordId']}
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
          <WindowToolbar onCalculate={handleSubmit} smallBox={true} />
        </Box>
      </CustomTabPanel>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </Box>
  )
}

export default ProductionRequestLog
