import { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import ErrorWindow from '@argus/shared-ui/src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ProductionClassWindow from './Windows/ProductionClassWindow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'

const MfProductionClasses = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: ManufacturingRepository.ProductionClass.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.ProductionClass.page,
    datasetId: ResourceIds.ProductionClass
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.ProductionClass.page
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

  const tabs = [{ label: _labels.class }, { label: _labels.semiFinishedItem, disabled: !editMode }]

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
      extension: ManufacturingRepository.ProductionClass.del,
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
        <ProductionClassWindow
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

export default MfProductionClasses
