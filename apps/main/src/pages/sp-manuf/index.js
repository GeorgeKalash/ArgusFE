import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/providers/windows'
import { ControlContext } from '@argus/shared-providers/providers/ControlContext'
import { RepairAndServiceRepository } from '@argus/repositories/repositories/RepairAndServiceRepository'
import SpManufacturerForm from './form/SpManufacturerForm'

const SpManufacturer = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: RepairAndServiceRepository.SpManufacturer.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    refetch,
    invalidate,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RepairAndServiceRepository.SpManufacturer.page,
    datasetId: ResourceIds.SpManufacturer
  })

  const columns = [
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: RepairAndServiceRepository.SpManufacturer.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: SpManufacturerForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 600,
      height: 200,
      title: labels.manufacturer
    })
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
          pageSize={50}
          paginationType='api'
          deleteConfirmationType='strict'
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
        />
      </Grow>
    </VertLayout>
  )
}

export default SpManufacturer
