import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { HRDashboardRepository } from '@argus/repositories/src/repositories/HRDashboardRepository'
import { formatMMMDDYY } from '@argus/shared-domain/src/lib/date-helper'

const RetirementAge = ({ window }) => {
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: HRDashboardRepository.RetirementAge.qry,
    datasetId: ResourceIds.EmployeeChart
  })

  useSetWindow({ title: labels.retirementAge, window })

  const columns = [
    {
      field: 'employeeInfo',
      headerName: labels.employee,
      flex: 2,
      wrapText: true,
      autoHeight: true,
      cellRenderer: ({ data }) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>{data?.employeeName || ''}{data?.age ? ` (${data.age})` : ''}</span>
        <span>{data?.birthDate ? formatMMMDDYY(data.birthDate) : ''}</span>
        </div>
      )
    },
    {
      field: 'days',
      headerName: labels.daysLeft,
      flex: 1
    }
  ]

  const parseDotNetDate = (date) => {
    const timestamp = Number(date.match(/-?\d+/)[0])
    return new Date(timestamp)
  }
  
  const calculateAge = (birthDateString) => {
    const birthDate = parseDotNetDate(birthDateString)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const hasHadBirthdayThisYear =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayThisYear) {
        age--
    }

    return age
  }

  async function fetchGridData() {
    const res = await getRequest({
        extension: HRDashboardRepository.RetirementAge.qry,
        parameters: `_params=`
    })

    const list = (res?.list || []).map(item => {
        return {
            ...item,
            age: item?.birthDate ? calculateAge(item.birthDate) : ''
        }
    })

    return {...res, list}
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='RetirementAge'
          maxAccess={access}
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

RetirementAge.width = 700
RetirementAge.height = 450

export default RetirementAge
