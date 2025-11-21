import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import toast from 'react-hot-toast'
import ReleaseCodeForm from './ReleaseCodeForm'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

const ReleaseCodeTab = ({ labels, maxAccess, recordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const columns = [
    {
      field: 'releaseCode',
      headerName: labels.code,
      flex: 1
    }
  ]

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: Boolean(recordId),
    endpointId: AccessControlRepository.SGReleaseCode.qry,
    datasetId: ResourceIds.SecurityGroup
  })

  async function fetchGridData() {
    if (!recordId) {
      return { list: [] }
    }

    return await getRequest({
      extension: AccessControlRepository.SGReleaseCode.qry,
      parameters: `_filter=&_sgId=${recordId}`
    })
  }

  const del = async obj => {
    await postRequest({
      extension: AccessControlRepository.SGReleaseCode.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
  }

  const add = () => {
    stack({
      Component: ReleaseCodeForm,
      props: {
        labels,
        recordId: recordId,
        maxAccess
      },
      width: 500,
      height: 400,
      title: labels.releaseCode
    })
  }

  return (
    <VertLayout>
      <Grow>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
        <Table
          name='release'
          columns={columns}
          gridData={data}
          rowId={['codeId']}
          onDelete={del}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default ReleaseCodeTab
