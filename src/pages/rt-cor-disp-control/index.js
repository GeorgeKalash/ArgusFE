import React, { useContext } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import CorrespondentDispersalForm from './Forms/CorrespondentDispersalControlForm'
import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'

const CorrespondentDispersal = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceSettingsRepository.Correspondent.qry2,
    datasetId: ResourceIds.CorrespondentDispersalControl
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    }
  ]

  async function fetchGridData() {
    return await getRequest({
      extension: RemittanceSettingsRepository.Correspondent.qry2,
      parameters: ``
    })
  }

  function openForm(recordId, interfaceId) {
    stack({
      Component: CorrespondentDispersalForm,
      props: {
        labels: labels,
        recordId,
        interfaceId,
        maxAccess: access
      },
      width: 1200,
      height: 600,
      title: labels.dispersalType
    })
  }

  const edit = obj => {
    openForm(obj?.recordId, obj?.interfaceId)
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          isLoading={false}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default CorrespondentDispersal
