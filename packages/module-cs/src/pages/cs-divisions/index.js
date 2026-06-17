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
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import DivisionsForm from './Forms/DivisionsForm'

const Divisions = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: companyStructureRepository.Divisions.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_size=30&_sortBy=name`
    })

    response.list = (response?.list || []).map(item => ({
      ...item,
      activeStatus: item?.activeStatus ? 'True' : 'False'
    }))
    

    return { ...response, _startAt }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access: maxAccess,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: companyStructureRepository.Divisions.page,
    datasetId: ResourceIds.Divisions
  })

  const columns = [
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'activeStatus',
      headerName: labels.activeStatus,
      flex: 1
    }
  ]

  const add = () => openForm()

  const edit = obj => openForm(obj?.recordId)

  const del = async obj => {
    await postRequest({
      extension: companyStructureRepository.Divisions.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: DivisionsForm,
      props: {
        labels,
        recordId,
        maxAccess
      },
      width: 500,
      height: 300,
      title: labels.divisions
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
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
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default Divisions