import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { useResourceQuery } from 'src/hooks/resource'
import OrgChart from 'src/components/Shared/OrgChart'
import { ResourceIds } from 'src/resources/ResourceIds'

function transformToOrgChartData(records) {
  return records.map(emp => {
    const displayName = `
        <div style="text-align:center">
          <img src="${emp.picture}" 
               style="width:120px;height:120px;border-radius:50%;margin-bottom:4px;" />
          <div style="font-weight:bold;">${emp.name}</div>
          <div style="font-size:12px;color:gray;">${emp.position}</div>
        </div>
      `

    return [{ v: String(emp.id), f: displayName }, emp.reportToId ? String(emp.reportToId) : '']
  })
}

const HREmployeeChart = () => {
  const { getRequest } = useContext(RequestsContext)

  async function fetchGridData() {
    const response = await getRequest({
      extension: EmployeeRepository.EmployeeChart.qry,
      parameters: `_filter=&_size=1000&_startAt=0&_sortBy=lastName&_params=11|1`
    })

    return response
  }

  function formatEmployees(emps) {
    const employeeIds = emps.map(x => x.parent?.recordId)

    return emps.map(item => ({
      id: item.parent?.recordId,
      reportToId: employeeIds.includes(item.parent?.reportToId) ? item.parent?.reportToId : '',
      name: item.parent?.fullName || '',
      parent: item.reportToName || '',
      position: item.position?.name || labels.employee,
      picture: '/images/icons/project-icons/defaultEmp.png',
      tooltip: "''"
    }))
  }

  const {
    query: { data },
    labels
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.EmployeeChart.qry,
    datasetId: ResourceIds.EmployeeChart
  })

  const orgData = data?.list ? transformToOrgChartData(formatEmployees(data.list)) : []

  return (
    <VertLayout>
      <Fixed>{orgData.length > 0 && <OrgChart data={orgData} allowCollapse={true} />}</Fixed>
    </VertLayout>
  )
}

export default HREmployeeChart
