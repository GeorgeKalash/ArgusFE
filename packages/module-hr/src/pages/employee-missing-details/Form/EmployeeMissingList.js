import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ReportRepository } from '@argus/repositories/src/repositories/ReportRepository'
import EmployeeWindow from '../Window/EmployeeWindow'

export default function EmployeeMissingList ({labels, maxAccess, fieldId, status}) {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData() {
    const response = await getRequest({
      extension: ReportRepository.EmployeeMissingDetails.RT107b,
      parameters: `_fieldId=${fieldId}&_activeStatus=${status}`
    })

    response.list = (response?.list || []).map(item => ({
      ...item,
      hireDate: item?.parent?.hireDate
    }))

    return response
  }
  
  const {
    query: { data }
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ReportRepository.EmployeeMissingDetails.RT107b,
    datasetId: ResourceIds.EmployeeMissingDetails,
  })

  const {
    labels: employeeLabels
  } = useResourceQuery({
    queryFn: fetchGridData,
    datasetId: ResourceIds.EmployeeFilter
  })

  const columns = [
    {
      field: 'pictureUrl',
      headerName: '',
      flex: 1,
      type: 'image'
    },
    {
      field: 'parent.reference',
      headerName: labels.ref,
      flex: 1
    },
    {
      field: 'parent.fullName',
      headerName: labels.name,
      flex: 2,
      wrapText: true,
      autoHeight: true
    },
    {
      field: 'department.name',
      headerName: labels.department,
      flex: 1
    },
    {
      field: 'position.name',
      headerName: labels.position,
      flex: 1,
      wrapText: true,
      autoHeight: true
    },
    {
      field: 'branch.name',
      headerName: labels.branch,
      flex: 1
    },
    {
      field: 'division.name',
      headerName: labels.schedule,
      flex: 1
    },
    {
      field: 'hireDate',
      headerName: labels.hireDate,
      flex: 1,
      type: 'date'
    }
  ]

  function openForm(obj) {
    stack({
      Component: EmployeeWindow,
      props: {
        labels: employeeLabels,
        recordId: obj?.recordId,
        employeeStatus: obj?.activeStatus,
        maxAccess
      },
      width: 1000,
      height: 700,
      title: labels.employee
    })
  }  

  const edit = obj => {
    openForm(obj?.parent)
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='Employeetable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}  
          onEdit={edit}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}
