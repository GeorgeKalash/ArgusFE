import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { PointofSaleRepository } from '@argus/repositories/src/repositories/PointofSaleRepository'
import PosUsersForm from './forms/PosUsersForm'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const PosUsers = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: PointofSaleRepository.PosUsers.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_posId=0&_params=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: labels,
    paginationParameters,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PointofSaleRepository.PosUsers.qry,
    datasetId: ResourceIds.POSUsers
  })

  const columns = [
    {
      field: 'email',
      headerName: labels.email,
      flex: 1
    },
    {
      field: 'posRef',
      headerName: labels.posRef,
      flex: 1
    },
    {
      field: 'spName',
      headerName: labels.spName,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const popup = obj => {
    openForm(obj)
  }

  const del = async obj => {
    await postRequest({
      extension: PointofSaleRepository.PosUsers.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(record) {
    stack({
      Component: PosUsersForm,
      props: {
        labels: labels,
        record,
        recordId: record?.userId,
        maxAccess: access
      },
      width: 600,
      height: 300,
      title: labels.PosUsers
    })
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
          rowId={['userId']}
          onEdit={popup}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
        />
      </Grow>
    </VertLayout>
  )
}

export default PosUsers
