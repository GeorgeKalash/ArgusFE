import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import toast from 'react-hot-toast'
import { useWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { FoundryRepository } from 'src/repositories/FoundryRepository'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import MetalSettingsForm from './Form/MetalSettingForm'

const MetalSetting = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: ManufacturingRepository.MetalSetting.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
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
    endpointId: ManufacturingRepository.MetalSetting.page,
    datasetId: ResourceIds.MetalSetting,
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
      field: 'damageItem',
      headerName: labels.damageItem,
      flex: 1,
      type: 'number'
    },
    {
      field: 'damageNonMetalItem',
      headerName: labels.damageNonMetalItem,
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
      Component: MetalSettingsForm,
      props: {
        labels,
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
          name='table'
          columns={columns}
          gridData={data}
          rowId={['metalId']}
          onEdit={edit}
          refetch={refetch}
          onDelete={del}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default MetalSetting
