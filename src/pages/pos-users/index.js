import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { PointofSaleRepository } from 'src/repositories/PointofSaleRepository'
import PosUsersForm from './forms/PosUsersForm'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const PosUsers = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: PointofSaleRepository.PosUsers.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_posId=0&_params=`
    })

    return { ...response, _startAt: _startAt }
  }

  const invalidate = useInvalidate({
    endpointId: PointofSaleRepository.PosUsers.qry
  })

  const {
    query: { data },
    labels: labels,
    paginationParameters,
    refetch,
    access
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
    openForm(obj?.userId)
  }

  const del = async obj => {
    await postRequest({
      extension: PointofSaleRepository.PosUsers.del,
      record: JSON.stringify(obj)
    })
    refetch()
    toast.success('Record Deleted Successfully')
  }

  function openForm(userId) {
    stack({
      Component: PosUsersForm,
      props: {
        labels: labels,
        userId: userId ? userId : null,
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
