import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { PayrollRepository } from 'src/repositories/PayrollRepository'

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
