import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ControlContext } from 'src/providers/ControlContext'
import MeasurementUnitForm from './MeasurementUnitForm'

const MeasurementUnit = ({ recordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()


  async function fetchGridData() {
    try {
      if (recordId) {
        const response = await getRequest({
          extension: InventoryRepository.MeasurementUnit.qry,
          parameters: `_msId=${recordId}`
        })
    
        return response
      }
    } catch (error) {}
  }

  const {
    query: { data },
    labels: _labels,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.MeasurementUnit.qry,
    datasetId: ResourceIds.Measurement
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
      field: 'qty',
      headerName: _labels.qty,
      flex: 1
    }
  ]

  const add = () => {
    openForm(null, recordId)
  }

  const edit = obj => {
    openForm(obj?.recordId, recordId)
  }

  function openForm(recordId, msId) {
    stack({
      Component: MeasurementUnitForm,
      props: {
        labels: _labels,
        recordId,
        msId,
        invalidate
      },
      width: 450,
      height: 330,
      title: _labels.measurementUnit
    })
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: InventoryRepository.MeasurementUnit.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (exception) {}
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
          pagination={false}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default MeasurementUnit
