import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import toast from 'react-hot-toast'
import { useWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import JobOrderWindow from './window/JobOrderWindow'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'

const JobOrder = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    filterBy,
    refetch,
    labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.MFJobOrder.qry,
    datasetId: ResourceIds.MFJobOrders,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'designRef',
      headerName: labels.design,
      flex: 1
    },
    {
      field: 'clientName',
      headerName: labels.client,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.item,
      flex: 1
    },
    {
      field: 'wcName',
      headerName: labels.workCenter,
      flex: 1
    },
    {
      field: 'className',
      headerName: labels.productionClass,
      flex: 1
    },
    {
      field: 'standardRef',
      headerName: labels.productionStandard,
      flex: 1
    },
    {
      field: 'pcs',
      headerName: labels.pcs,
      flex: 1,
      type: 'number'
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'startingDT',
      headerName: labels.startingDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'deliveryDate',
      headerName: labels.deliveryDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'endingDT',
      headerName: labels.endingDate,
      flex: 1,
      type: 'date'
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: ManufacturingRepository.MFJobOrder.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_sortBy=recordId desc&_params=${params}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: ManufacturingRepository.MFJobOrder.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.JobOrder,
    action: openForm,
    hasDT: false
  })

  const add = async () => {
    proxyAction()
  }

  const editJOB = obj => {
    openForm(obj?.recordId)
  }

  async function openForm(recordId) {
    stack({
      Component: JobOrderWindow,
      props: {
        labels,
        access,
        recordId
      },
      width: 1150,
      height: 700,
      title: labels.jobOrder
    })
  }

  const delJOB = async obj => {
    await postRequest({
      extension: ManufacturingRepository.MFJobOrder.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'MFJOB'} />
      </Fixed>
      <Grow>
        <Table
          name='jobTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={editJOB}
          refetch={refetch}
          onDelete={delJOB}
          deleteConfirmationType={'strict'}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default JobOrder
