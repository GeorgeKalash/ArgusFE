import { useContext } from 'react'
import toast from 'react-hot-toast'
import MetalSmeltingDTDForm from './Forms/MetalSmeltingDTDForm'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Fixed } from "@argus/shared-ui/src/components/Layouts/Fixed"
import { VertLayout } from "@argus/shared-ui/src/components/Layouts/VertLayout"
import { Grow } from "@argus/shared-ui/src/components/Layouts/Grow"
import Table from "@argus/shared-ui/src/components/Shared/Table"
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'

const MetalSmeltingDTD = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FoundryRepository.DocumentTypeDefault.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_functionId=${SystemFunction.MetalSmelting}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    invalidate,
    refetch,
    access,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FoundryRepository.DocumentTypeDefault.page,
    datasetId: ResourceIds.MetalSmeltingDTD
  })

  const columns = [
    {
      field: 'dtName',
      headerName: labels.documentType,
      flex: 1
    },
    {
      field: 'smeltingMaxAllowedVariation',
      headerName: labels.smeltingMaxAllowedVariation,
      flex: 1,
      type: 'number'
    }
  ]

  const add = () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: FoundryRepository.DocumentTypeDefault.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(record) {
    stack({
      Component: MetalSmeltingDTDForm,
      props: {
        labels,
        recordId: record?.dtId,
        maxAccess: access
      },
      width: 600,
      height: 350,
      title: labels.MetalSmeltingDTD
    })
  }

  const edit = obj => {
    openForm(obj)
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
          rowId={['dtId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          refetch={refetch}
          paginationType='api'
          paginationParameters={paginationParameters}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default MetalSmeltingDTD
