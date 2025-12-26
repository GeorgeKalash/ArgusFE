import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { ControlContext } from 'src/providers/ControlContext'
import RolesForm from './RolesForm'
import { ResourceIds } from 'src/resources/ResourceIds'
import GridToolbar from 'src/components/Shared/GridToolbar'

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
