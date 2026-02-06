import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { FinancialStatementRepository } from '@argus/repositories/src/repositories/FinancialStatementRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import StatementWindow from './windows/StatementWindow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'

const FinancialStatements = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    refetch,
    labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialStatementRepository.FinancialStatement.page,
    datasetId: ResourceIds.FinancialStatements
  })

  const columns = [
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'isConfidential',
      headerName: labels.isConfidential,
      flex: 1,
      type: 'checkbox'
    },
    {
      field: 'sgName',
      headerName: labels.securityGrp,
      flex: 1
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FinancialStatementRepository.FinancialStatement.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: FinancialStatementRepository.FinancialStatement.del,
      record: JSON.stringify(obj)
    })

    invalidate()
    toast.success(platformLabels.Deleted)
  }

  async function openForm(recordId) {
    stack({
      Component: StatementWindow,
      props: {
        labels,
        maxAccess: access,
        recordId
      },
      width: 1000,
      height: 630,
      title: labels.financialStatement
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} labels={labels} />
      </Fixed>
      <Grow>
        <Table
          name='FiStatementTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          refetch={refetch}
          pageSize={50}
          paginationType='api'
          maxAccess={access}
          paginationParameters={paginationParameters}
        />
      </Grow>
    </VertLayout>
  )
}

export default FinancialStatements
