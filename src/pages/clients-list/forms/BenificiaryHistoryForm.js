import Table from 'src/components/Shared/Table'
import { useContext } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

export default function BenificiaryHistoryForm({ client, beneficiary }) {
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceOutwardsRepository.Beneficiary.qry2,
    datasetId: ResourceIds.Beneficiary
  })

  async function fetchGridData() {
    const res = await getRequest({
      extension: RemittanceOutwardsRepository.Beneficiary.qry2,
      parameters: `_clientId=${client}&_beneficiaryId=${beneficiary}`
    })
    res.list = res.list.map(item => {
      if (item.isInactive === null) {
        item.isInactive = false
      }

      return item
    })

    return res
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 2
    },
    {
      field: 'addressLine1',
      headerName: _labels.addressLine1,
      flex: 2
    },
    {
      field: 'nationalityName',
      headerName: _labels.nationalityId,
      flex: 1
    },
    {
      field: 'countryName',
      headerName: _labels.country,
      flex: 1
    },
    {
      field: 'accountReference',
      headerName: _labels.accountRef,
      flex: 1
    },
    {
      field: 'branchName',
      headerName: _labels.branchName,
      flex: 1
    },
    {
      field: 'dispersalTypeName',
      headerName: _labels.dispersalType,
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: _labels.isInactive,
      type: 'checkbox',
      flex: 1
    }
  ]

  return (
    <VertLayout>
      <Table
        width={500}
        height={400}
        columns={columns}
        gridData={data}
        rowId={['beneficiaryId']}
        isLoading={false}
        pagination={false}
        maxAccess={access}
      />
    </VertLayout>
  )
}
