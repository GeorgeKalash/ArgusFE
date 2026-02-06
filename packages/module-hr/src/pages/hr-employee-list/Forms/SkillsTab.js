import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import SkillsForm from './SkillsForm'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'

const SkillsTab = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { recordId } = store

  async function fetchGridData() {
    const response = await getRequest({
      extension: EmployeeRepository.Skills.qry,
      parameters: `_filter=&_size=30_startAt=0&_employeeId=${recordId}`
    })

    return response
  }

  const {
    query: { data },
    refetch,
    invalidate
  } = useResourceQuery({
    enabled: !!recordId,
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.Skills.qry,
    datasetId: ResourceIds.EmployeeFilter
  })

  const columns = [
    {
      field: 'clName',
      headerName: labels.level,
      flex: 1
    },
    {
      field: 'institution',
      headerName: labels.institution,
      flex: 1
    },
    {
      field: 'dateFrom',
      headerName: labels.from,
      flex: 1,
      type: 'date'
    },
    {
      field: 'dateTo',
      headerName: labels.to,
      flex: 1,
      type: 'date'
    },
    {
      field: 'grade',
      headerName: labels.grade,
      flex: 1
    },
    {
      field: 'major',
      headerName: labels.major,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: EmployeeRepository.Skills.del,
      record: JSON.stringify(obj)
    })

    toast.success(platformLabels.Deleted)
    invalidate()
  }

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const openForm = id => {
    stack({
      Component: SkillsForm,
      props: {
        labels,
        maxAccess,
        recordId: id,
        employeeId: recordId
      },
      width: 600,
      height: 500,
      title: labels.Skills
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='skillsTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          pagination={false}
          refetch={refetch}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default SkillsTab
