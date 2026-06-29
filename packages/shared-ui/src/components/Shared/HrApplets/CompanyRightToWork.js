import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { HRDashboardRepository } from '@argus/repositories/src/repositories/HRDashboardRepository'

const CompanyRightToWork = ({ window }) => {
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: HRDashboardRepository.CompanyRTW.qry,
    datasetId: ResourceIds.RightToWork
  })

  useSetWindow({ title: labels.rightToWork, window })

  const columns = [
    {
      field: 'documentRef',
      headerName: labels.documentRef,
      flex: 1
    },
    {
      field: 'dtName',
      headerName: labels.docType,
      flex: 1
    },
    {
      field: 'branchName',
      headerName: labels.branch,
      flex: 1
    },
    {
      field: 'days',
      headerName: labels.daysLeft,
      flex: 1,
      cellRenderer: params => {
        const value = params.value
        if (value == null) return ''

        return `${value} ${labels.daysLeft}`
    }
    },
    {
      field: 'remarks',
      headerName: labels.remarks,
      flex: 1
    }
  ]

  async function fetchGridData() {
    return await getRequest({
        extension: HRDashboardRepository.CompanyRTW.qry,
        parameters: `_params=`
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='rightToWork'
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

CompanyRightToWork.width = 1000
CompanyRightToWork.height = 500

export default CompanyRightToWork
