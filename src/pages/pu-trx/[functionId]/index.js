import { Grow } from '@mui/material'
import React, { useContext } from 'react'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { useError } from 'src/error'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import Table from 'src/components/Shared/Table'
import PurchaseTransactionForm from './PurchaseTransactionForm'
import { Router } from 'src/lib/useRouter'
import toast from 'react-hot-toast'

const PuTrx = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  const { functionId } = Router()

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.PurchaseInvoice:
        return ResourceIds.PurchaseInvoice
      case SystemFunction.PurchaseReturn:
        return ResourceIds.PurchaseReturn
      default:
        return null
    }
  }

  const getEndpoint = {
    [SystemFunction.PurchaseInvoice]: {
      del: PurchaseRepository.PurchaseInvoiceHeader.del
    },
    [SystemFunction.PurchaseReturn]: {
      del: PurchaseRepository.PurchaseReturnHeader.del
    }
  }

  const {
    query: { data },
    filterBy,
    refetch,
    labels: labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId:
      parseFloat(functionId) === SystemFunction.PurchaseInvoice
        ? PurchaseRepository.PurchaseInvoiceHeader.qry
        : PurchaseRepository.PurchaseReturnHeader.qry,
    datasetId: ResourceIds.PurchaseInvoice,
    DatasetIdAccess: getResourceId(parseInt(functionId)),
    filter: {
      filterFn: fetchWithFilter,
      default: { functionId }
    }
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'dueDate',
      headerName: labels.dueDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'vendorName',
      headerName: labels.vendor,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'volume',
      headerName: labels.volume,
      flex: 1,
      type: 'number'
    },
    {
      field: 'amount',
      headerName: labels.net,
      flex: 1,
      type: 'number'
    },
    {
      field: 'pcs',
      headerName: labels.pcs,
      flex: 1,
      type: 'number'
    },
    {
      field: 'qty',
      headerName: labels.totQty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'weight',
      headerName: labels.weight,
      flex: 1,
      type: 'number'
    },
    {
      field: 'description',
      headerName: labels.description,
      flex: 2
    },
    {
      field: 'isVerified',
      headerName: labels.isVerified,
      type: 'checkbox'
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension:
        parseFloat(functionId) === SystemFunction.PurchaseInvoice
          ? PurchaseRepository.PurchaseInvoiceHeader.qry
          : PurchaseRepository.PurchaseReturnHeader.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&&_params=${params}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension:
          parseFloat(functionId) === SystemFunction.PurchaseInvoice
            ? PurchaseRepository.PurchaseInvoiceHeader.snapshot
            : PurchaseRepository.PurchaseReturnHeader.snapshot,
        parameters:
          `_filter=${filters.qry}` +
          (parseFloat(functionId) === SystemFunction.PurchaseReturn ? `&_functionId=${parseFloat(functionId)}` : '')
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  async function getDefaultSalesCurrency() {
    const defaultCurrency = defaultsData?.list?.find(({ key }) => key === 'currencyId')

    return parseInt(defaultCurrency?.value) || null
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: functionId,
    action: async () => {
      const currency = await getDefaultSalesCurrency()
      currency
        ? openForm()
        : stackError({
            message: labels.noSelectedCurrency
          })
    }
  })

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const getCorrectLabel = functionId => {
    if (parseFloat(functionId) === SystemFunction.PurchaseInvoice) {
      return labels.purchaseInvoice
    } else if (parseFloat(functionId) === SystemFunction.PurchaseReturn) {
      return labels.purchaseReturn
    }
  }

  async function openForm(recordId) {
    stack({
      Component: PurchaseTransactionForm,
      props: {
        labels,
        recordId,
        access,
        functionId
      },
      width: 1330,
      height: 720,
      title: getCorrectLabel(parseInt(functionId))
    })
  }

  const add = async () => {
    await proxyAction()
  }

  const del = async obj => {
    await postRequest({
      extension: getEndpoint[functionId]?.['del'],
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onAdd={add}
          maxAccess={access}
          reportName={parseFloat(functionId) === SystemFunction.PurchaseInvoice ? 'PUIVC' : 'PUIVR'}
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

export default PuTrx
