import { DeliveryRepository } from '@argus/repositories/src/repositories/DeliveryRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { LockedScreensContext } from '@argus/shared-providers/src/providers/LockedScreensContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useContext } from 'react'
import toast from 'react-hot-toast'
import InboundTranspForm from './Forms/InboundTranspForm'
import NormalDialog from '@argus/shared-ui/src/components/Shared/NormalDialog'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Table from '@argus/shared-ui/src/components/Shared/Table'

export default function InboundTransp() {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack, lockRecord } = useWindow()
  const { addLockedScreen } = useContext(LockedScreensContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: DeliveryRepository.InboundTransp.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })
  }

  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: DeliveryRepository.InboundTransp.snapshot,
      parameters: `_filter=${qry}`
    })

  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access,
    search,
    clear,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: DeliveryRepository.InboundTransp.page,
    datasetId: ResourceIds.InboundTransportation,
    search: {
      endpointId: DeliveryRepository.InboundTransp.snapshot,
      searchFn: fetchWithSearch
    }
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'tripRef',
      headerName: labels.outbound,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'arrivalTime',
      headerName: labels.arrivalDate,
      flex: 1,
      type: 'dateTime'
    },
    {
      field: 'plantName',
      headerName: labels.plant,
      flex: 1
    },
    {
      field: 'driverName',
      headerName: labels.driver,
      flex: 1
    },
    {
      field: 'vehicleName',
      headerName: labels.vehicle,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    }
  ]

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.InboundTransportation,
    action: openForm
  })

  const add = async () => {
    proxyAction()
  }

  const edit = obj => {
    openForm(obj?.recordId, obj?.reference, obj?.status)
  }

  async function openStack(recordId) {
    stack({
      Component: InboundTranspForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 1300,
      height: 700,
      title: labels.inboundTransp
    })
  }

  async function openForm(recordId, reference, status) {
    if (recordId && status != 3) {
      await lockRecord({
        recordId,
        reference,
        resourceId: ResourceIds.InboundTransportation,
        onSuccess: () => {
          addLockedScreen({
            resourceId: ResourceIds.InboundTransportation,
            recordId,
            reference
          })
          openStack(recordId)
        },
        isAlreadyLocked: name => {
          stack({
            Component: NormalDialog,
            props: {
              DialogText: `${platformLabels.RecordLocked} ${name}`,
              title: platformLabels.Dialog
            }
          })
        }
      })
    } else openStack(recordId)

  }

  const del = async obj => {
    await postRequest({
      extension: DeliveryRepository.InboundTransp.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          labels={labels}
          onAdd={add}
          maxAccess={access}
          inputSearch={true}
          onSearch={search}
          onSearchClear={clear}
        />
      </Fixed>
      <Grow>
        <Table
          name='InboundTranspTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}
