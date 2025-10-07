import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialStatementRepository } from 'src/repositories/FinancialStatementRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import StatementWindow from './windows/StatementWindow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import GridToolbar from 'src/components/Shared/GridToolbar'

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
      field: 'securityGroup',
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
      width: 800,
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
