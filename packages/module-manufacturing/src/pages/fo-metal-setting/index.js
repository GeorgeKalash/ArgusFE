import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import toast from 'react-hot-toast'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import MetalSettingsWindow from './Windows/MetalSettingsWindow'

const MetalSettings = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FoundryRepository.MetalSettings.page,
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
    endpointId: FoundryRepository.MetalSettings.page,
    datasetId: ResourceIds.MetalSettings,
  })

  const columns = [
    {
      field: 'metalRef',
      headerName: labels.metal,
      flex: 1
    },
    {
      field: 'metalColorRef',
      headerName: labels.metalColor,
      flex: 1
    },
    {
      field: 'rate',
      headerName: labels.rate,
      flex: 1,
      type: 'number'
    },
    {
      field: 'stdLossRate',
      headerName: labels.stdLossRate,
      flex: 1,
      type: 'number'
    }
  ]

  const add = async () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  async function openForm(obj) {
    stack({
      Component: MetalSettingsWindow,
      props: {
        labels: labels,
        metalColorId: obj?.metalColorId,
        recordId: obj?.metalId,
        maxAccess: access
      },
      width: 800,
      height: 500,
      title: labels.MetalSettings
    })
  }

  const del = async obj => {
    await postRequest({
      extension: FoundryRepository.MetalSettings.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} labels={labels} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['metalId']}
          onEdit={edit}
          refetch={refetch}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default MetalSettings
