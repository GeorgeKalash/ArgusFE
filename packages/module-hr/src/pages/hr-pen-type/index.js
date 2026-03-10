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
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import HrPenTypeWindow from './Window/HrPenTypeWindow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const HrPenType = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: PayrollRepository.PenaltyType.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return {
      ...response,

      _startAt: _startAt
    }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PayrollRepository.PenaltyType.page,
    datasetId: ResourceIds.PenaltyType
  })

  const columns = [
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'reasonString',
      headerName: labels.reason,
      flex: 1
    },
    {
      field: 'timeBaseString',
      headerName: labels.timeBase,
      flex: 1
    },
    {
      field: 'from',
      headerName: labels.from,
      flex: 1,
      type: 'number'
    },
    {
      field: 'to',
      headerName: labels.to,
      flex: 1,
      type: 'number'
    },
    {
      field: 'timeCodeName',
      headerName: labels.timeVariationType,
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
      extension: PayrollRepository.PenaltyType.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)

    invalidate()
  }

  function openForm(recordId) {
    stack({
      Component: HrPenTypeWindow,
      props: {
        labels,
        recordId,
        access
      },
      width: 800,
      height: 420,
      title: labels.penaltyType
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
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default HrPenType
