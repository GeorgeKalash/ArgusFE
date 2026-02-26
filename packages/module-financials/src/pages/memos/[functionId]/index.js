import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import MemosForm from './MemosForm'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { Router } from '@argus/shared-domain/src/lib/useRouter'

const Financial = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const { functionId } = Router()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: FinancialRepository.FiMemo.page,
      parameters: `_startAt=${_startAt}&_params=${
        params || ''
      }&_pageSize=${_pageSize}&_sortBy=reference&_functionId=${functionId}`
    })

    return { ...response, _startAt: _startAt }
  }

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.CreditNote:
        return ResourceIds.CreditNote
      case SystemFunction.DebitNote:
        return ResourceIds.DebitNote
      case SystemFunction.ServiceBill:
        return ResourceIds.ServiceBillReceived
      case SystemFunction.ServiceInvoice:
        return ResourceIds.ServiceInvoice
      default:
        return null
    }
  }

  const {
    query: { data },
    refetch,
    labels: _labels,
    filterBy,
    paginationParameters,
    access,
    invalidate
  } = useResourceQuery({
    endpointId: FinancialRepository.FiMemo.page,
    datasetId: ResourceIds.CreditNote,
    DatasetIdAccess: getResourceId(parseInt(functionId)),
    queryFn: fetchGridData,
    filter: {
      filterFn: fetchWithSearch,
      default: { functionId }
    }
  })

  async function fetchWithSearch({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: FinancialRepository.FiMemo.snapshot,
        parameters: `_filter=${filters.qry}&_functionId=${functionId}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'accountRef',
      headerName: _labels.accountRef,
      flex: 1
    },
    {
      field: 'accountName',
      headerName: _labels.accountName,
      flex: 1
    },
    {
      field: 'sourceReference',
      headerName: _labels.sourceReference,
      flex: 1
    },
    {
      field: 'amount',
      headerName: _labels.amount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'currencyName',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'plantName',
      headerName: _labels.plant,
      flex: 1
    },

    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    },

    {
      field: 'notes',
      headerName: _labels.notes,
      flex: 1
    },
    {
      field: 'isVerified',
      headerName: _labels.isVerified,
      type: 'checkbox'
    }
  ]

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const getcorrectLabel = functionId => {
    if (functionId === SystemFunction.CreditNote) {
      return _labels.creditNote
    } else if (functionId === SystemFunction.DebitNote) {
      return _labels.debitNote
    } else if (functionId === SystemFunction.ServiceBill) {
      return _labels.serviceBill
    } else if (functionId === SystemFunction.ServiceInvoice) {
      return _labels.serviceInvoice
    } else {
      return null
    }
  }

  const getEndpoint = functionId => {
    switch (functionId) {
      case SystemFunction.CreditNote:
        return FinancialRepository.CreditNote
      case SystemFunction.DebitNote:
        return FinancialRepository.DebitNote
      case SystemFunction.ServiceBill:
        return FinancialRepository.ServiceBillReceived
      case SystemFunction.ServiceInvoice:
        return FinancialRepository.ServiceInvoice
      default:
        return null
    }
  }

  const getGLResourceId = functionId => {
    const fn = Number(functionId)
    switch (fn) {
      case SystemFunction.CreditNote:
        return ResourceIds.GLCreditNote
      case SystemFunction.DebitNote:
        return ResourceIds.GLDebitNote
      case SystemFunction.ServiceBill:
        return ResourceIds.GLServiceBillReceived
      case SystemFunction.ServiceInvoice:
        return ResourceIds.GLServiceInvoice
      default:
        return null
    }
  }

  function openForm(recordId) {
    stack({
      Component: MemosForm,
      props: {
        labels: _labels,
        recordId: recordId,
        access,
        functionId: functionId,
        getEndpoint,
        getGLResourceId
      },
      width: 1200,
      height: 670,
      title: getcorrectLabel(parseInt(functionId))
    })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: functionId,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  const del = async obj => {
    await postRequest({
      extension: getEndpoint(parseInt(functionId)).del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'FIMEM'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          refetch={refetch}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default Financial
