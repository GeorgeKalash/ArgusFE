import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CommissionScheduleWindow from './Windows/CommissionScheduleWindow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'

const CommissionSchedule = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels,
    paginationParameters,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.CommissionSchedule.qry,
    datasetId: ResourceIds.CommissionSchedule
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: SaleRepository.CommissionSchedule.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'typeName',
      headerName: labels.type,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: SaleRepository.CommissionSchedule.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
  }

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: CommissionScheduleWindow,
      props: {
        labels,
        recordId,
        access
      },
      width: 600,
      title: labels.CommissionSchedule
    })
  }

  const onEdit = obj => {
    openForm(obj?.recordId)
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
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={onEdit}
          onDelete={del}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default CommissionSchedule
