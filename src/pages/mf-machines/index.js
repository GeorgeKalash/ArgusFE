import { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import MachinesWindow from './Windows/MachinesWindow'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const Machines = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: ManufacturingRepository.Machine.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.Machine.page,
    datasetId: ResourceIds.Machines
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Machine.page
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
    },
    {
      field: 'workCenterName',
      headerName: _labels.workCenterName,
      flex: 1
    },
    {
      field: 'operationName',
      headerName: _labels.operationName,
      flex: 1
    },
    {
      field: 'laborName',
      headerName: _labels.laborName,
      flex: 1
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
    try {
      await postRequest({
        extension: ManufacturingRepository.MachineSpecification.del,
        record: JSON.stringify({ machineId: obj.recordId })
      })
      await postRequest({
        extension: ManufacturingRepository.Machine.del,
        record: JSON.stringify(obj)
      })
      toast.success('Record Deleted Successfully')
      invalidate()
    } catch (error) {
      setErrorMessage(error)
    }
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
          paginationType='client'
          maxAccess={access}
        />
      </Grow>

      {windowOpen && (
        <MachinesWindow
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

export default Machines
