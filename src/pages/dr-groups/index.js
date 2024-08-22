// ** React Imports
import { useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import DRGroupWindow from './Windows/DRGroupWindow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const DRGroups = () => {
  const { stack } = useWindow()
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: DocumentReleaseRepository.DRGroup.qry,

      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: DocumentReleaseRepository.DRGroup.qry,
    datasetId: ResourceIds.DRGroups
  })

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.DRGroup.qry
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: DRGroupWindow,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 600,
      height: 400,
      title: _labels.group
    })
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: DocumentReleaseRepository.DRGroup.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />{' '}
      </Fixed>
      <Grow>
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
      </Grow>

      {windowOpen && (
        <DRGroupWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default DRGroups
