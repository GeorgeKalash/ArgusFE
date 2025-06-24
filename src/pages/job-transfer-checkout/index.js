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
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import JTCheckoutForm from './forms/JTCheckoutForm'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'

const JTCheckout = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: ManufacturingRepository.JobTransfer.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

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
    endpointId: ManufacturingRepository.JobTransfer.page,
    datasetId: ResourceIds.JTCheckOut,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination = {} }) {
    const { _startAt = 0, _size = 50 } = pagination
    if (filters.qry) {
      const response = await getRequest({
        extension: ManufacturingRepository.JobTransfer.snapshot,
        parameters: `_filter=${filters.qry}&_startAt=${_startAt}&_size=${_size}`
      })

      return { ...response, _startAt: _startAt }
    } else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const columns = [
    {
      field: 'dtName',
      headerName: labels.docType,
      flex: 1
    },
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
      field: 'jobRef',
      headerName: labels.jobOrder,
      flex: 1
    },
    {
      field: 'designRef',
      headerName: labels.designRef,
      flex: 1
    },
    {
      field: 'fromWCName',
      headerName: labels.fromWorkCenter,
      flex: 1
    },
    {
      field: 'toWCName',
      headerName: labels.toWorkCenter,
      flex: 1
    },
    {
      field: 'pcs',
      headerName: labels.pieces,
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
    }
  ]

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.JTCheckOut,
    action: openForm
  })

  function openForm(obj) {
    stack({
      Component: JTCheckoutForm,
      props: {
        labels,
        recordId: obj?.recordId,
        access
      },
      width: 1200,
      height: 700,
      title: labels.jtCheckout
    })
  }

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    proxyAction()
  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.JobTransfer.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'MFTFR'} />
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
          paginationType='api'
          paginationParameters={paginationParameters}
          deleteConfirmationType={'strict'}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default JTCheckout
