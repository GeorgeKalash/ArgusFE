import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import USDocTypeForm from './USDocTypeForm'

const DocTypeTab = ({ labels, maxAccess, storeRecordId }) => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const columns = [
    {
      field: 'functionId',
      headerName: labels.functionId,
      flex: 1
    },
    {
      field: 'sfName',
      headerName: labels.systemFunction,
      flex: 2
    },
    {
      field: 'dtName',
      headerName: labels.docType,
      flex: 2
    }
  ]

  const {
    query: { data },
    labels: _labels,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: Boolean(storeRecordId),
    endpointId: SystemRepository.UserFunction.qry,
    datasetId: ResourceIds.Users
  })

  async function fetchGridData() {
    if (!storeRecordId) {
      return { list: [] }
    }

    return await getRequest({
      extension: SystemRepository.UserFunction.qry,
      parameters: `_userId=${storeRecordId}&_filter=`
    })
  }

  const edit = async obj => {
    stack({
      Component: USDocTypeForm,
      props: {
        labels: _labels,
        storeRecordId: storeRecordId || null,
        functionId: obj.functionId,
        maxAccess: maxAccess,
        invalidate: invalidate
      },
      width: 600,
      height: 500,
      title: _labels.docType
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='docType'
          columns={columns}
          gridData={data}
          rowId={['userId', 'functionId']}
          onEdit={edit}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default DocTypeTab