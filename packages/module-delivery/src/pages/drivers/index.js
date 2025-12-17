import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import DriversForm from './forms/DriversForm'
import { DeliveryRepository } from '@argus/repositories/src/repositories/DeliveryRepository'

const Drivers = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access,
    invalidate,
    search,
    clear
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: DeliveryRepository.Driver.page,
    datasetId: ResourceIds.Drivers,
    search: {
      searchFn: fetchWithSearch
    }
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: DeliveryRepository.Driver.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: DeliveryRepository.Driver.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  const columns = [
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'cellPhone',
      headerName: labels.cellPhone,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: DriversForm,
      props: {
        labels: labels,
        recordId,
        maxAccess: access
      },
      width: 600,
      height: 350,
      title: labels.drivers
    })
  }

  const del = async obj => {
    await postRequest({
      extension: DeliveryRepository.Driver.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          labels={labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          name='driverTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
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

export default Drivers
