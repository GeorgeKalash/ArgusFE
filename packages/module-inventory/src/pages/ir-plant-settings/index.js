import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import PlantSettingsForm from './Form/PlantSettingsForm'

const PlantSettings = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: SystemRepository.Plant.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    refetch,
    access,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.Plant.page,
    datasetId: ResourceIds.IRPlantSettings
  })

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
      field: 'costCenterName',
      headerName: labels.costCenter,
      flex: 1
    }
  ]

  function openForm(record) {
    
    stack({
      Component: PlantSettingsForm,
      props: {
        labels,
        recordId: record?.recordId,
        maxAccess: access
      },
      width: 600,
      height: 500,
      title: labels.PlantSettings
    })
  }

  const edit = obj => {
    openForm(obj)
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['dtId']}
          onEdit={edit}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationType='api'
          paginationParameters={paginationParameters}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default PlantSettings
