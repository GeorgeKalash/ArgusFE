import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import FunctionForm from './FunctionForm'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const FunctionsTab = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const columns = [
    {
      field: 'functionName',
      headerName: labels.function,
      flex: 1
    },
    {
      field: 'strategyName',
      headerName: labels.strategy,
      flex: 1
    }
  ]

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: !!recordId,
    endpointId: DocumentReleaseRepository.ClassFunction.qry,
    datasetId: ResourceIds.Classes,
    params: { disabledReqParams: true, maxAccess }
  })

  async function fetchGridData() {
    if (!recordId) return { list: [] }

    return await getRequest({
      extension: DocumentReleaseRepository.ClassFunction.qry,
      parameters: `_classId=${recordId}`
    })
  }

  const del = async obj => {
    await postRequest({
      extension: DocumentReleaseRepository.ClassFunction.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
  }

  const add = () => openForm()

  const edit = obj => openForm(obj)

  function openForm(record) {
    stack({
      Component: FunctionForm,
      props: {
        labels,
        classId: recordId,
        record,
        maxAccess
      },
      width: 400,
      height: 350,
      title: labels.functions
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='functions'
          columns={columns}
          gridData={data}
          rowId={['functionId']}
          onEdit={edit}
          onDelete={del}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default FunctionsTab