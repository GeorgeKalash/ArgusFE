import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import EquipmentWindow from './Windows/EquipmentWindow'

const Equipment = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: RepairAndServiceRepository.Equipment.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    refetch,
    labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RepairAndServiceRepository.Equipment.page,
    datasetId: ResourceIds.Equipment
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'make',
      headerName: labels.make,
      flex: 1
    },
    {
      field: 'year',
      headerName: labels.year,
      flex: 1
    },
    {
      field: 'description',
      headerName: labels.description,
      flex: 1
    }
  ]

  function openForm(obj) {
    stack({
      Component: EquipmentWindow,
      props: {
        labels,
        recordId: obj?.recordId,
        maxAccess: access
      },
      width: 1000,
      height: 700,
      title: labels.Equipment
    })
  }

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: RepairAndServiceRepository.Equipment.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default Equipment
