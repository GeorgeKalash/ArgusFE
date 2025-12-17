import { FoundryRepository } from "@argus/repositories/src/repositories/FoundryRepository"
import { ResourceIds } from "@argus/shared-domain/src/resources/ResourceIds"
import { ControlContext } from "@argus/shared-providers/src/providers/ControlContext"
import { RequestsContext } from "@argus/shared-providers/src/providers/RequestsContext"
import { useWindow } from "@argus/shared-providers/src/providers/windows"
import { Fixed } from "@argus/shared-ui/src/components/Layouts/Fixed"
import { VertLayout } from "@argus/shared-ui/src/components/Layouts/VertLayout"
import { Grow } from "@argus/shared-ui/src/components/Layouts/Grow"
import Table from "@argus/shared-ui/src/components/Shared/Table"
import GridToolbar from "@argus/shared-ui/src/components/Shared/GridToolbar"
import AlloyMetalsForm from "./Form/AlloyMetalsForm"
import { useResourceQuery } from "@argus/shared-hooks/src/hooks/resource"
import { useContext} from 'react'
import toast from 'react-hot-toast'

const AlloyMetals = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FoundryRepository.AlloyMetals.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    invalidate,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FoundryRepository.AlloyMetals.page,
    datasetId: ResourceIds.AlloyMetals
  })

  const columns = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: FoundryRepository.AlloyMetals.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: AlloyMetalsForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 500,
      height: 200,
      title: labels.AlloyMetals
    })
  }

  const edit = obj => {
    openForm(obj?.itemId)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default AlloyMetals
