import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { PayrollRepository } from 'src/repositories/PayrollRepository'
import HrPenTypeWindow from './Window/HrPenTypeWindow'
import { CommonContext } from 'src/providers/CommonContext'
import { DataSets } from 'src/resources/DataSets'
import { ControlContext } from 'src/providers/ControlContext'

const HrPenType = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: PayrollRepository.PenaltyType.page,

      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    const timeCodes = await new Promise(resolve => {
      getAllKvsByDataset({
        _dataset: DataSets.TIME_CODE,
        callback: resolve
      })
    })

    const timeCodeMap = Object.fromEntries(timeCodes.map(tc => [tc.key, tc.value]))

    return {
      ...response,
      list: response.list.map(row => ({
        ...row,
        timeCodeName: timeCodeMap[row.timeCode]
      })),
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
      flex: 1
    },
    {
      field: 'to',
      headerName: labels.to,
      flex: 1
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
      height: 460,
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
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
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
