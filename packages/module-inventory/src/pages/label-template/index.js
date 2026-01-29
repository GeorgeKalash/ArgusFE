import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import LabelTemplateWindow from './Windows/LabelTemplateWindow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SCRepository } from '@argus/repositories/src/repositories/SCRepository'

const LabelTemplate = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    refetch,
    labels: _labels,
    invalidate,
    access
  } = useResourceQuery({
    endpointId: SCRepository.LabelTemplate.qry,
    queryFn: fetchGridData,
    datasetId: ResourceIds.LabelTemplates
  })

  async function fetchGridData() {
    const response = await getRequest({
      extension: SCRepository.LabelTemplate.qry,
      parameters: ''
    })

    return response
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'height',
      headerName: _labels.height,
      flex: 1
    },
    {
      field: 'width',
      headerName: _labels.width,
      flex: 1
    }
  ]

  const del = obj => {
    postRequest({
      extension: SCRepository.LabelTemplate.del,
      record: JSON.stringify(obj)
    })
      .then(() => {
        invalidate()
        toast.success(platformLabels.Deleted)
      })
  }

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: LabelTemplateWindow,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 800,
      height: 450,
      title: _labels.labeltemplate
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} labels={_labels} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          refetch={refetch}
          paginationType='client'
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default LabelTemplate
