import { useContext } from 'react'
import toast from 'react-hot-toast'
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
import MetalTrxDTDForm from './Forms/MetalTrxDTDForm'
import { Router } from '@argus/shared-domain/src/lib/useRouter'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'

const MetalTrxDTD = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { functionId } = Router()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FoundryRepository.DocumentTypeDefault.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_functionId=${Number(functionId)}`
    })

    return { ...response, _startAt: _startAt }
  }

   const getResourceId = functionId => {
    const fn = Number(functionId)
    switch (fn) {
        case SystemFunction.MetalSmelting:
            return ResourceIds.MetalSmeltingDTD
        case SystemFunction.MetalCalibration:
            return ResourceIds.MetalCalibrationDTD
        default:
            return null
    }
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
    datasetId: ResourceIds.MetalSmeltingDTD,
    DatasetIdAccess: getResourceId(parseInt(functionId)),
    filter: {
      filterFn: fetchGridData,
      default: { functionId }
    }
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
  

  const getCorrectLabel = functionId => {
    if (functionId === SystemFunction.MetalSmelting) {
        return labels.MetalSmeltingDTD
    } else if (functionId === SystemFunction.MetalCalibration) {
        return labels.MetalCalibrationDTD
    } else {
        return null
    }
   }

  function openForm(record) {
    stack({
      Component: MetalTrxDTDForm,
      props: {
        labels,
        recordId: record?.dtId,
        functionId: Number(functionId),
        maxAccess: access
      },
      width: 600,
      height: 350,
      title: getCorrectLabel(parseInt(functionId))
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

export default MetalTrxDTD
