import { useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import DocumentTypeMapWindow from './Windows/DocumentTypeMapWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const DocumentTypeMaps = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const [selectedFromFunctionId, setSelectedFromFunctionId] = useState(null)
  const [selectedFromDTId, setSelectedFromDTId] = useState(null)
  const [selectedToFunctionId, setSelectedToFunctionId] = useState(null)

  async function fetchGridData() {
    return await getRequest({
      extension: SystemRepository.DocumentTypeMap.qry,
      parameters: `_filter=&_params=`
    })
  }

  const invalidate = useInvalidate({
    endpointId: SystemRepository.DocumentTypeMap.qry
  })

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.DocumentTypeMap.qry,
    datasetId: ResourceIds.DocumentTypeMaps
  })

  const columns = [
    {
      field: 'fromFunctionName',
      headerName: _labels.fromFunction,
      flex: 1
    },
    {
      field: 'fromDTName',
      headerName: _labels.fromDocument,
      flex: 1
    },
    {
      field: 'toFunctionName',
      headerName: _labels.toFunction,
      flex: 1
    },
    {
      field: 'toDTName',
      headerName: _labels.toDocument,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: SystemRepository.DocumentTypeMap.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const add = () => {
    setWindowOpen(true)
    setSelectedFromFunctionId(null)
    setSelectedFromDTId(null)
    setSelectedToFunctionId(null)
    setSelectedRecordId(null)
  }

  const edit = obj => {
    setSelectedFromFunctionId(obj.fromFunctionId)
    setSelectedFromDTId(obj.fromDTId)
    setSelectedToFunctionId(obj.toFunctionId)
    const rec = String(obj.fromFunctionId) + String(obj.fromDTId) + String(obj.toFunctionId)
    setSelectedRecordId(rec)
    setWindowOpen(true)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['fromFunctionId', 'fromDTId', 'toFunctionId']}
          onEdit={edit}
          onDelete={del}
          refetch={refetch}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>

      {windowOpen && (
        <DocumentTypeMapWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
          fromFunctionId={selectedFromFunctionId}
          fromDTId={selectedFromDTId}
          toFunctionId={selectedToFunctionId}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default DocumentTypeMaps
