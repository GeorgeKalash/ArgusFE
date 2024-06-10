import { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import RoutingWindow from './Windows/RoutingWindow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const Routings = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: ManufacturingRepository.Routing.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.Routing.page,
    datasetId: ResourceIds.Routings
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Routing.page
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1,
      editable: false
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1,
      editable: false
    }
  ]

  const tabs = [{ label: _labels.routing }, { label: _labels.routingSeq, disabled: !editMode }]

  const add = () => {
    setWindowOpen(true)
    setActiveTab(0)
    setEditMode(false)
  }

  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
    setActiveTab(0)
    setEditMode(true)
  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.Routing.del,
      record: JSON.stringify(obj)
    })

    invalidate()
    toast.success('Record Deleted Successfully')
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
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Grow>

      {windowOpen && (
        <RoutingWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
          activeTab={activeTab}
          tabs={tabs}
          editMode={editMode}
          setEditMode={setEditMode}
          setErrorMessage={setErrorMessage}
          setActiveTab={setActiveTab}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default Routings
