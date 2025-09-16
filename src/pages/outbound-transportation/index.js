import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import OutboundTranspForm from './forms/OutboundTranspForm'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { LockedScreensContext } from 'src/providers/LockedScreensContext'
import NormalDialog from 'src/components/Shared/NormalDialog'

const OutboundTransp = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack, lockRecord } = useWindow()
  const { addLockedScreen } = useContext(LockedScreensContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: DeliveryRepository.Trip.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}&_sortBy=recordId desc`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: DeliveryRepository.Trip.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const {
    query: { data },
    labels: _labels,
    filterBy,
    paginationParameters,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: DeliveryRepository.Trip.page,
    datasetId: ResourceIds.Trip,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'dtName',
      headerName: _labels.docType,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'departureTime',
      headerName: _labels.departureDate,
      flex: 1,
      type: 'dateTime'
    },
    {
      field: 'arrivalTime',
      headerName: _labels.arrivalDate,
      flex: 1,
      type: 'dateTime'
    },
    {
      field: 'plantName',
      headerName: _labels.plant,
      flex: 1
    },
    {
      field: 'driverName',
      headerName: _labels.driver,
      flex: 1
    },
    {
      field: 'vehName',
      headerName: _labels.vehicle,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    },
    {
      field: 'printStatusName',
      headerName: _labels.printStatus,
      flex: 1
    },
    {
      field: 'notes',
      headerName: _labels.notes,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId, obj?.reference, obj?.status)
  }

  async function openStack(recordId) {
    stack({
      Component: OutboundTranspForm,
      props: {
        labels: _labels,
        recordId,
        maxAccess: access
      },
      width: 1300,
      height: 700,
      title: _labels.outboundTransp
    })
  }

  async function openForm(recordId, reference, status) {
    if (recordId && status !== 3) {
      await lockRecord({
        recordId: recordId,
        reference: reference,
        resourceId: ResourceIds.Trip,
        onSuccess: () => {
          addLockedScreen({
            resourceId: ResourceIds.Trip,
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
    } else {
      openStack(recordId)
    }
  }

  const del = async obj => {
    await postRequest({
      extension: DeliveryRepository.Trip.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          labels={_labels}
          onAdd={add}
          maxAccess={access}
          inputSearch={true}
          reportName={'DETRP'}
          filterBy={filterBy}
        />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
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

export default OutboundTransp
