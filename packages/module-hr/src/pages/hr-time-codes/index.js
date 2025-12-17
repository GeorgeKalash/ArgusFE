import { useContext } from 'react'
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
import TimeCodesForm from './forms/TimeCodesForm'

const TimeCodes = () => {
  const { getRequest } = useContext(RequestsContext)
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
