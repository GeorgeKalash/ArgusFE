import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import LineItemCapacityForm from './forms/LineItemCapacityForm'

const LineItemCapacity = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(filters = {}) {
    const { params } = filters

    return await getRequest({
      extension: ManufacturingRepository.LineItemCapacity.qry,
      parameters: `_params=${params || ''}`
    })
  }

  async function fetchWithFilter({ filters }) {
    return fetchGridData({ params: filters?.params })
  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    access,
    invalidate,
    filterBy
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.LineItemCapacity.page,
    datasetId: ResourceIds.LineItemCapacity,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'sku',
      headerName: _labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'classRef',
      headerName: _labels.prodClass,
      flex: 1
    },
    {
      field: 'lineRef',
      headerName: _labels.lineRef,
      flex: 1
    },
    {
      field: 'fullCapacityWgtPerHr',
      headerName: _labels.fullCapacityWgtPerHr,
      flex: 1
    },
    {
      field: 'preparationHrs',
      headerName: _labels.preparationHrs,
      flex: 1
    },
    {
      field: 'nbOfLabors',
      headerName: _labels.nbOfLabors,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.LineItemCapacity.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    openForm()
  }

  function openForm(obj) {
    const { itemId, itemName, sku, classId, classRef, className } = obj || {}
    stack({
      Component: LineItemCapacityForm,
      props: {
        labels: _labels,
        maxAccess: access,
        itemId,
        itemName,
        sku,
        classRef,
        className
      },
      width: 750,
      height: 500,
      title: _labels.exRate
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'MFLIT'} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['itemId']}
          onEdit={edit}
          onDelete={del}
          maxAccess={access}
          refetch={refetch}
          pageSize={50}
          paginationType='client'
        />
      </Grow>
    </VertLayout>
  )
}

export default LineItemCapacity
