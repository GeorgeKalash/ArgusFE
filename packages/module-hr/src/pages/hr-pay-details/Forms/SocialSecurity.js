import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useContext } from 'react'

const SocialSecurity = ({ labels, maxAccess, store }) => {
  const { getRequest } = useContext(RequestsContext)
  const { recordId, seqNo } = store
  const editMode = !!recordId

  const columns = [
    {
      field: 'payCode',
      headerName: labels.payCode,
      flex: 1
    },
    {
      field: 'pcName',
      headerName: labels.payCodeName,
      flex: 1
    },
    {
      field: 'ePct',
      headerName: labels.percentage,
      flex: 1
    },
    {
      field: 'essAmount',
      headerName: labels.ess,
      flex: 1
    },
    {
      field: 'cPct',
      headerName: labels.percentage,
      flex: 1
    },
    {
      field: 'cssAmount',
      headerName: labels.css,
      flex: 1
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: PayrollRepository.SocialSecurity.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_payId=${recordId}&_seqNo=${seqNo}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data }
  } = useResourceQuery({
    enabled: editMode,
    queryFn: fetchGridData,
    endpointId: PayrollRepository.SocialSecurity.qry,
    datasetId: ResourceIds.PayrollDetail,
    params: { disabledReqParams: true, maxAccess }
  })

  return (
    <VertLayout>
      <Grow>
        <Table
          name='socialSecurity'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default SocialSecurity
