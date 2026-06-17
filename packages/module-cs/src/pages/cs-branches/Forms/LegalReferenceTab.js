import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import LegalReferenceForm from './LegalReferenceForm'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const LegalReferenceTab = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const columns = [
    {
      field: 'goName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'releaseDate',
      headerName: labels.releaseDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'expiryDate',
      headerName: labels.expiryDate,
      flex: 1,
      type: 'date'
    }
  ]

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: !!recordId,
    endpointId: companyStructureRepository.BranchLegalRef.qry,
    datasetId: ResourceIds.Branches
  })

  async function fetchGridData() {
    if (!recordId) return { list: [] }

    return await getRequest({
      extension: companyStructureRepository.BranchLegalRef.qry,
      parameters: `_branchId=${recordId}`
    })
  }

  const del = async obj => {
    await postRequest({
      extension: companyStructureRepository.BranchLegalRef.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
  }

  const edit = obj => openForm(obj)

  function openForm(record) {
    stack({
      Component: LegalReferenceForm,
      props: {
        labels,
        branchId: recordId,
        record,
        maxAccess,
        invalidate
      },
      width: 500,
      height: 400,
      title: labels.legalReference
    })
  }

  return (
    <VertLayout>
      <Grow>
        <GridToolbar maxAccess={maxAccess} />
        <Table
          name='legalReference'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default LegalReferenceTab