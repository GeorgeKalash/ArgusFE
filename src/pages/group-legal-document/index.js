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

import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'

// ** Windows
import GroupLegalDocumentWindow from './Windows/GroupLegalDocumentWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const GroupLegalDocument = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [selectedIncId, setSelectedIncId] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: BusinessPartnerRepository.GroupLegalDocument.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: BusinessPartnerRepository.GroupLegalDocument.page,
    datasetId: ResourceIds.GroupLegalDocument
  })

  const invalidate = useInvalidate({
    endpointId: BusinessPartnerRepository.GroupLegalDocument.page
  })

  const columns = [
    {
      field: 'groupName',
      headerName: _labels.group,
      flex: 1
    },
    {
      field: 'incName',
      headerName: _labels.categoryId,
      flex: 1
    },
    {
      field: 'required',
      headerName: _labels.required,
      flex: 1
    },
    {
      field: 'mandatory',
      headerName: _labels.mandatory,
      flex: 1
    }
  ]

  const add = () => {
    setWindowOpen(true)
    setSelectedGroupId(null)
    setSelectedIncId(null)
  }

  const edit = obj => {
    // setSelectedRecordId(obj.recordId)
    setWindowOpen(true)

    setSelectedGroupId(obj.groupId)
    setSelectedIncId(obj.incId)
  }

  const del = async obj => {
    await postRequest({
      extension: BusinessPartnerRepository.GroupLegalDocument.del,
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
          rowId={['groupId', 'incId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Grow>

      {windowOpen && (
        <GroupLegalDocumentWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
          groupId={selectedGroupId}
          incId={selectedIncId}
        />
      )}

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default GroupLegalDocument

BusinessPartnerRepository.CategoryID.qry
BusinessPartnerRepository.Group.qry
