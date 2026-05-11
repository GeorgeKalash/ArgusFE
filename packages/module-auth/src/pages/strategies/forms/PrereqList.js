import { useContext } from 'react'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import toast from 'react-hot-toast'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import PreReqsForm from './PrereqForm'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const PreReqsList = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData() {
    const response = await getRequest({
      extension: DocumentReleaseRepository.StrategyPrereq.qry,
      parameters: `&_strategyId=${recordId}`
    })

    return response
  }

  const {
    query: { data },
    labels: _labels,
    invalidate
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.Strategies,
    queryFn: fetchGridData,
    endpointId: DocumentReleaseRepository.StrategyPrereq.qry
  })

  const columns = [
    {
      field: 'code',
      headerName: labels.code,
      flex: 1
    },
    {
      field: 'prerequisiteCode',
      headerName: labels.prerequisite,
      flex: 1
    }
  ]

  const addCode = () => {
    openForm()
  }

  const delCode = async obj => {
    await postRequest({
      extension: DocumentReleaseRepository.StrategyPrereq.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: PreReqsForm,
      props: {
        labels: labels,
        recordId,
        maxAccess,
        store
      },
      width: 500,
      height: 300,
      title: labels.prere
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={addCode} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='preReq'
          columns={columns}
          gridData={data}
          rowId={['code']}
          pagination={false}
          onDelete={delCode}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default PreReqsList
