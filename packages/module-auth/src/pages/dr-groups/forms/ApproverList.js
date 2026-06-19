import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ApproverForm from './ApproverForm'

const ApproverList = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store
  const { stack } = useWindow()

  async function fetchGridData() {
    return await getRequest({
      extension: DocumentReleaseRepository.GroupCode.qry,
      parameters: `_filter=&_groupId=${recordId}`
    })
  }

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.DRGroups,
    queryFn: fetchGridData,
    endpointId: DocumentReleaseRepository.GroupCode.qry
  })

  const columns = [
    { 
      field: 'codeRef', 
      headerName: labels.reference, 
      flex: 1 
    },
    { 
      field: 'codeName', 
      headerName: labels.name, 
      flex: 1 
    }
  ]

  const add = () => openForm()

  const del = async obj => {
    await postRequest({
      extension: DocumentReleaseRepository.GroupCode.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(record) {
    stack({
      Component: ApproverForm,
      props: {
        labels,
        record,
        maxAccess,
        store
      },
      width: 500,
      height: 300,
      title: labels.approver
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='approver'
          columns={columns}
          gridData={data}
          rowId={['codeId']}
          pagination={false}
          onDelete={del}
          onEdit={obj => openForm(obj)}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default ApproverList