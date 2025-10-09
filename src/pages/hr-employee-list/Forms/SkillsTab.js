import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import SkillsForm from './SkillsForm'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'

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
