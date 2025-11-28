import React, { useContext } from 'react'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { PurchaseRepository } from '@argus/repositories/src/repositories/PurchaseRepository'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import CorrespondentDispersalForm from './Forms/CorrespondentDispersalControlForm'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

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

  function openForm(obj) {
    stack({
      Component: CorrespondentDispersalForm,
      props: {
        labels,
        recordId: obj?.recordId,
        interfaceId: obj?.interfaceId,
        corName: obj?.name,
        maxAccess: access
      },
      width: 1200,
      height: 600,
      title: labels.dispersalType
    })
  }

  const edit = obj => {
    openForm(obj)
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
