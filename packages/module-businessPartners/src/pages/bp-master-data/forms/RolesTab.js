import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { BusinessPartnerRepository } from '@argus/repositories/src/repositories/BusinessPartnerRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import RolesForm from './RolesForm'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'

const RolesTab = ({ store, maxAccess, labels }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData() {
    const response = await getRequest({
      extension: BusinessPartnerRepository.MasterDataRole.qry,
      parameters: `_filter=&_bpId=${recordId}`
    })

    return response
  }

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    enabled: !!recordId,
    queryFn: fetchGridData,
    datasetId: ResourceIds.BPMasterData,
    endpointId: BusinessPartnerRepository.MasterDataRole.qry,
    params: { disabledReqParams: true, maxAccess }
  })

  const columns = [{ field: 'roleName', headerName: labels.name, flex: 1 }]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj.roleId)
  }

  function openForm(roleId) {
    stack({
      Component: RolesForm,
      props: {
        labels,
        maxAccess,
        recordId,
        roleId
      },
      width: 500,
      height: 400,
      title: labels.role
    })
  }

  const del = async obj => {
    await postRequest({
      extension: BusinessPartnerRepository.MasterDataRole.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='rolesTable'
          columns={columns}
          maxAccess={maxAccess}
          gridData={data}
          rowId={['roleId']}
          pagination={false}
          onEdit={edit}
          onDelete={del}
        />
      </Grow>
    </VertLayout>
  )
}

export default RolesTab
