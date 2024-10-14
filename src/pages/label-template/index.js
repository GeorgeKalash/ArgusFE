import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import LabelTemplateWindow from './Windows/LabelTemplateWindow'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { SCRepository } from 'src/repositories/SCRepository'

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
      .then(res => {
        invalidate()
        toast.success(platformLabels.Deleted)
      })
      .catch(error => {})
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
