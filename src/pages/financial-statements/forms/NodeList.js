import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialStatementRepository } from 'src/repositories/FinancialStatementRepository'
import { useWindow } from 'src/windows'
import NodeWindow from '../windows/NodeWindow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'
import toast from 'react-hot-toast'
import { useResourceQuery } from 'src/hooks/resource'

const NodeList = ({ node, mainRecordId, setRecId, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: Boolean(mainRecordId),
    endpointId: FinancialStatementRepository.Node.qry
  })

  async function fetchGridData() {
    return getRequest({
      extension: FinancialStatementRepository.Node.qry,
      parameters: `_fsId=${mainRecordId}`
    })
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'parentRef',
      headerName: labels.parent,
      flex: 1
    },
    {
      field: 'description',
      headerName: labels.description,
      flex: 1
    },
    {
      field: 'TBAmountName',
      headerName: labels.amount,
      flex: 1
    },
    {
      field: 'displayOrder',
      headerName: labels.order,
      flex: 1,
      type: 'number'
    },
    {
      field: 'numberFormatName',
      headerName: labels.format,
      flex: 1
    },
    {
      field: 'flags',
      headerName: labels.flags,
      flex: 1,
      type: 'number'
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: FinancialStatementRepository.Node.del,
      record: JSON.stringify(obj)
    })
    node.current.nodeId = null
    node.current.reference = ''
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm() {
    stack({
      Component: NodeWindow,
      props: {
        labels,
        maxAccess,
        mainRecordId,
        setRecId,
        node
      },
      height: 520,
      width: 500,
      title: labels.node
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={openForm} maxAccess={maxAccess} labels={labels} />
      </Fixed>
      <Grow>
        <Table
          name='nodeTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={openForm}
          onDelete={del}
          maxAccess={maxAccess}
          pagination={false}
          onSelectionChange={row => {
            node.current.nodeId = row?.recordId || null
            node.current.reference = row?.reference || ''
          }}
        />
      </Grow>
    </VertLayout>
  )
}

export default NodeList
