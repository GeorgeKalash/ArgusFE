import { useContext } from 'react'
import { Box } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'

const ProductionRequestLog = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()

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
    calculateLeans()
  }

  const calculateLeans = () => {
    const checkedObjects = data.list.filter(obj => obj.checked)

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

  return (
    <Box>
      <Table
        columns={columns}
        gridData={data}
        rowId={['recordId']}
        isLoading={false}
        maxAccess={access}
        showCheckboxColumn={true}
        handleCheckedRows={() => {}}
        pagination={false}
      />
      <WindowToolbar onCalculate={handleSubmit} smallBox={true} />
    </Box>
  )
}

export default ProductionRequestLog
