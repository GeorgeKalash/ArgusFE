// ** React Imports
import { useContext,useState } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'
import toast from 'react-hot-toast'

// ** Custom Imports
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'

// ** API
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { RequestsContext } from 'src/providers/RequestsContext'

// ** Windows
import SalaryRangeWindow from './Windows/SalaryRangeWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const SalaryRange = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  
  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: RemittanceSettingsRepository.SalaryRange.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceSettingsRepository.SalaryRange.page,
    datasetId: ResourceIds.SalaryRange
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.SalaryRange.page
  })
  
  const columns = [
    {
      field: 'min',
      headerName: _labels[2],
      flex: 1,
      editable: false
    },
    {
      field: 'max',
      headerName: _labels[3],
      flex: 1,
      editable: false
    }
  ]

  const add = () => {
    setWindowOpen(true)
  }
  
  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
  }
  
  const del = async obj => {
    await postRequest({
      extension: RemittanceSettingsRepository.SalaryRange.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  return (
    <>
      <Box>
        <GridToolbar onAdd={add} maxAccess={access} />

        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationType='client'
        />
      </Box>
      {windowOpen && (
        <SalaryRangeWindow
          onClose={() =>{setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default SalaryRange