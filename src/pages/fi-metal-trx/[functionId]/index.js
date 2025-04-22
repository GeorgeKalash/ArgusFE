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
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ControlContext } from 'src/providers/ControlContext'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import MetalTrxFinancialForm from './form/MetalTrxFinancialForm'
import { Router } from 'src/lib/useRouter'

export default function MetalTrxFinancial() {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { functionId } = Router()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: FinancialRepository.MetalTrx.page,
      parameters: `_startAt=${_startAt}&_params=${
        params || ''
      }&_pageSize=${_pageSize}&_sortBy=reference&_functionId=${functionId}`
    })

    return { ...response, _startAt: _startAt }
  }

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.MetalReceiptVoucher:
        return ResourceIds.MetalReceiptVoucher
      case SystemFunction.MetalPaymentVoucher:
        return ResourceIds.MetalPaymentVoucher
      default:
        return
    }
  }

  const {
    query: { data },
    refetch,
    labels,
    filterBy,
    clearFilter,
    paginationParameters,
    access,
    invalidate
  } = useResourceQuery({
    endpointId: FinancialRepository.MetalTrx.page,
    datasetId: ResourceIds.MetalReceiptVoucher,
    DatasetIdAccess: getResourceId(parseInt(functionId)),
    filter: {
      filterFn: fetchWithSearch,
      default: { functionId }
    }
  })

  async function fetchWithSearch({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: FinancialRepository.MetalTrx.snapshot,
        parameters: `_filter=${filters.qry}&_functionId=${functionId}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'dtName',
      headerName: labels.docType,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },

    {
      field: 'plantName',
      headerName: labels.plant,
      flex: 1
    },
    {
      field: 'siteRef',
      headerName: labels.siteRef,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: labels.siteName,
      flex: 1
    },
    {
      field: 'accountRef',
      headerName: labels.accountRef,
      flex: 1
    },
    {
      field: 'accountName',
      headerName: labels.accountName,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'creditAmount',
      headerName: labels.creditAmount,
      flex: 1,
      type: 'number'
    },

    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const getcorrectLabel = functionId => {
    if (functionId === SystemFunction.MetalReceiptVoucher) {
      return labels.metalReceipt
    } else if (functionId === SystemFunction.MetalPaymentVoucher) {
      return labels.metalPayment
    } else {
      return null
    }
  }

  function openForm(recordId) {
    stack({
      Component: MetalTrxFinancialForm,
      props: {
        labels,
        recordId,
        access,
        functionId
      },
      width: 900,
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
      extension: FinancialRepository.MetalTrx.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'FIMTX'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
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
