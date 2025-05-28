import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { Router } from 'src/lib/useRouter'
import { SystemFunction } from 'src/resources/SystemFunction'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import BalanceTransferForm from './forms/BalanceTransferForm'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'

const BalanceTfrTrx = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { functionId } = Router()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: FinancialRepository.BalanceTransfer.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&_functionId=${functionId}`
    })

    return { ...response, _startAt: _startAt }
  }

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.BalanceTransferPurchase:
        return ResourceIds.BalanceTransferPurchase
      case SystemFunction.BalanceTransferSales:
        return ResourceIds.BalanceTransferSales
    }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: FinancialRepository.BalanceTransfer.snapshot,
        parameters: `_filter=${filters.qry}&_functionId=${functionId}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const resourceId = getResourceId(parseInt(functionId))

  const {
    query: { data },
    labels,
    refetch,
    filterBy,
    invalidate,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.BalanceTransfer.page,
    datasetId: ResourceIds.BalanceTransferPurchase,
    DatasetIdAccess: resourceId,
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
      field: 'dtName',
      headerName: labels.docType,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      type: 'date',
      flex: 1
    },
    {
      field: 'plantName',
      headerName: labels.plant,
      flex: 1
    },
    {
      field: 'fromAccountRef',
      headerName: labels.accountRef,
      flex: 1
    },
    {
      field: 'fromAccountName',
      headerName: labels.accountName,
      flex: 1
    },
    {
      field: 'fromCurrencyName',
      headerName: labels.fromCurrency,
      flex: 1
    },
    {
      field: 'toCurrencyName',
      headerName: labels.toCurrency,
      flex: 1
    },
    {
      field: 'fromAmount',
      headerName: labels.amount,
      flex: 1,
      type: { field: 'number', decimal: 2 }
    },
    {
      field: 'fromBaseAmount',
      headerName: labels.baseAmount,
      flex: 1,
      type: { field: 'number', decimal: 2 }
    },
    {
      field: 'fromExRate',
      headerName: labels.rate,
      flex: 1,
      type: 'number'
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1.5
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]

  const { proxyAction } = useDocumentTypeProxy({
    functionId: functionId,
    action: openForm
  })

  const del = async obj => {
    await postRequest({
      extension: FinancialRepository.BalanceTransfer.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const add = () => {
    proxyAction()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }
  function openForm(recordId) {
    stack({
      Component: BalanceTransferForm,
      props: {
        labels,
        recordId,
        access,
        functionId,
        resourceId
      },
      width: 800,
      height: 550,
      title: labels.balanceTransfer
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'FITFR'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          deleteConfirmationType='strict'
          paginationParameters={paginationParameters}
          refetch={refetch}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default BalanceTfrTrx
