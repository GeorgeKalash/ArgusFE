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
import MaterialsAdjustmentWindow from 'src/pages/materials-adjustment/Windows/MaterialsAdjustmentWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import { useWindow } from 'src/windows'
import MaterialsAdjustmentForm from '../materials-adjustment/Forms/MaterialsAdjustmentForm'
import useResourceParams from 'src/hooks/useResourceParams'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

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

  const { labels: _labelsADJ, access: accessADJ } = useResourceParams({
    datasetId: ResourceIds.MaterialsAdjustment
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.LeanProductionPlanning.preview
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
      field: 'itemName',
      headerName: _labels[4],
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels[6],
      flex: 1,
      valueFormatter: params => {
        const dateString = params.value
        const timestamp = parseInt(dateString.match(/\d+/)[0], 10)

        if (!isNaN(timestamp)) {
          const formattedDate = new Date(timestamp).toLocaleDateString('en-GB')

          return formattedDate
        } else {
          return 'Invalid Date'
        }
      }
    }
  ]

  const gateKeeperValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {},
    initialValues: {
      rows: [{}]
    },
    onSubmit: values => {
      generateLean()
    }
  })

  const handleSubmit = () => {
    gateKeeperValidation.handleSubmit()
  }

  const handleCheckedRows = checkedRows => {
    setSelectedRows(prevSelectedRows => [...prevSelectedRows, ...checkedRows])
  }

  useEffect(() => {}, [selectedRows])

  const { stack } = useWindow()

  const generateLean = () => {
    // Filter out objects where checked is truthy
    const checkedObjects = selectedRows.filter(obj => obj.checked)

    const resultObject = {
      leanProductions: checkedObjects
    }

    postRequest({
      extension: ManufacturingRepository.MaterialsAdjustment.generate,
      record: JSON.stringify(resultObject)
    })
      .then(res => {
        invalidate()
        setSelectedRows([])

        // Call MaterialsAdjustmentForm component here
        stack({
          Component: MaterialsAdjustmentForm,
          props: {
            recordId: res.recordId,
            labels: _labelsADJ,
            maxAccess: accessADJ
          },
          width: 900,
          height: 600,
          title: _labelsADJ[1]
        })

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
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId', 'seqNo']}
          isLoading={false}
          maxAccess={access}
          showCheckboxColumn={true}
          handleCheckedRows={handleCheckedRows}
          pagination={false}
        />
      </Grow>

      <Fixed>
        {' '}
        <WindowToolbar onSave={handleSubmit} smallBox={true} />
      </Fixed>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default GateKeeper
