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
import { ControlContext } from 'src/providers/ControlContext'
import { PayrollRepository } from 'src/repositories/PayrollRepository'
import TimeCodesForm from './forms/TimeCodesForm'

const TimeCodes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: PayrollRepository.TimeCodes.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    invalidate,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PayrollRepository.TimeCodes.page,
    datasetId: ResourceIds.TimeCodes
  })

  const columns = [
    {
      field: 'name',
      headerName: labels.TimeCode,
      flex: 1
    },
    {
      field: 'edName',
      headerName: labels.entDed,
      flex: 1
    },
    {
      field: 'edTypeName',
      headerName: labels.type,
      flex: 1
    },
    {
      field: 'gracePeriod',
      headerName: labels.gracePeriod,
      flex: 1
    }
  ]

  const edit = obj => {
    stack({
      Component: TimeCodesForm,
      props: {
        labels,
        recordId: obj?.timeCode,
        maxAccess: access
      },
      width: 500,
      height: 320,
      title: labels.timeCode
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
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

export default TimeCodes
