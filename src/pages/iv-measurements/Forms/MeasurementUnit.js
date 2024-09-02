import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ControlContext } from 'src/providers/ControlContext'
import MeasurementUnitForm from './MeasurementUnitForm'

const MeasurementUnit = ({ store, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [measurementUnitGridData, setMeasurementUnitGridData] = useState([])
  const { stack } = useWindow()

  const getMeasurementUnitGridData = async msId => {
    try {
      const response = await getRequest({
        extension: InventoryRepository.MeasurementUnit.qry,
        parameters: `_msId=${msId}`
      })

      setMeasurementUnitGridData(response) 
    } catch (error) {}
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const openForm = id => { 
    stack({
      Component: MeasurementUnitForm,
      props: {
        labels,
        maxAccess: maxAccess,
        recordId: id,
        msId: recordId,
        store,
        getMeasurementUnitGridData
      },
      width: 450,
      height: 330,
      title: labels.measurementUnit
    })
  }

  useEffect(() => {
    if (recordId) {
      getMeasurementUnitGridData(recordId)
    }
  }, [recordId])

  const del = async obj => {
    try {
      await postRequest({
        extension: InventoryRepository.MeasurementUnit.del,
        record: JSON.stringify(obj)
      })
      toast.success(platformLabels.Deleted)
      await getMeasurementUnitGridData(recordId)
    } catch (exception) {}
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={measurementUnitGridData}
          rowId={['recordId']}
          api={getMeasurementUnitGridData}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default MeasurementUnit
