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
import { getNewLean, populateLean } from 'src/Models/Manufacturing/Lean'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'

const GateKeeper = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()

  //states
  const [errorMessage, setErrorMessage] = useState(null)
  const [selectedRows, setSelectedRows] = useState({})

  async function getGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.preview,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_status=2`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: getGridData,
    endpointId: ManufacturingRepository.LeanProductionPlanning.preview,
    datasetId: ResourceIds.GateKeeper
  })

  const columns = [
    {
      field: 'sku',
      headerName: _labels[1],
      flex: 1
    },
    {
      field: 'qty',
      headerName: _labels[2],
      flex: 1
    },
    {
      field: 'leanStatusName',
      headerName: _labels[3],
      flex: 1
    },
    {
      field: 'itemName',
      headerName: _labels[4],
      flex: 1
    },
    {
      field: 'reference',
      headerName: _labels[5],
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels[6],
      flex: 1,
      valueFormatter: (params) => {
        const dateString = params.value;
        const timestamp = parseInt(dateString.match(/\d+/)[0], 10);
        
        if (!isNaN(timestamp)) {
            const formattedDate = new Date(timestamp).toLocaleDateString('en-GB');
          
            return formattedDate;
        } else {
            return "Invalid Date";
        }
    }
    }
  ]
console.log('labels ',_labels)

  const gateKeeperValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {},
    initialValues: {
      rows: [{
      }]
    },
    onSubmit: values => {
      generateLean()
    }
  })

  const handleSubmit = () => {
    gateKeeperValidation.handleSubmit()
  }

  const handleCheckedRows = checkedRows => {
     // Filter the rows to include only those with checked: true
  const updatedRowsArray = checkedRows
  
  //.filter(row => row.checked);
    setSelectedRows(updatedRowsArray)
    console.log('selected ',selectedRows)
  }

  const generateLean = () => {
       postRequest({
         extension: ManufacturingRepository.LeanProductionPlanning.generate,
         record: JSON.stringify(selectedRows)
       })
         .then(res => {
           getGridData({})
           setWindowOpen(false)
           if (!recordId) toast.success('Record Added Successfully')
           else toast.success('Record Edited Successfully')
         })
         .catch(error => {
           setErrorMessage(error)
         })
  }
  useEffect(() => {
    setSelectedRows([])
  },[])

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
          <WindowToolbar onSave={handleSubmit}  smallBox={true}/>
        </Box>
      </CustomTabPanel>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </Box>
  )
}

export default GateKeeper
