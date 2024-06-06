import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import ItemSelectorWindow from 'src/components/Shared/ItemSelectorWindow'
import { useContext, useState } from 'react'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { SystemRepository } from 'src/repositories/SystemRepository'
import USDocTypeForm from './USDocTypeForm'

const DocTypeTab = ({ labels, maxAccess, storeRecordId, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const columns = [
    {
      field: 'sfName',
      headerName: labels.functionName,
      flex: 1
    },
    {
      field: 'dtName',
      headerName: labels.docTypeName,
      flex: 1
    }
  ]

  const {
    query: { data },
    labels: _labels
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
        recordId: obj.recordId ? obj.recordId : null,
        functionId: obj.functionId,
        maxAccess: maxAccess
      },
      width: 600,
      height: 500,
      title: _labels.docType
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data ? data : { list: [] }}
          rowId={['userId', 'functionId']}
          onEdit={edit}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default DocTypeTab
