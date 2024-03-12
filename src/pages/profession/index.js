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
import ProfessionsWindow from './Windows/ProfessionsWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const Professions = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  
  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: RemittanceSettingsRepository.Profession.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return {...response,  _startAt: _startAt}

  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceSettingsRepository.Profession.page,
    datasetId: ResourceIds.Profession
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.Profession.page
  })
  
  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1,
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1,
    },
    {
      field: 'flName',
      headerName: _labels.flName,
      flex: 1,
    },
    {
      field: 'monthlyIncome',
      headerName: _labels.monthlyIncome,
      flex: 1,
    },
    {
      field: 'riskFactor',
      headerName: _labels.riskFactor,
      flex: 1,
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
      extension: RemittanceSettingsRepository.Profession.del,
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
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <ProfessionsWindow
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

export default Professions