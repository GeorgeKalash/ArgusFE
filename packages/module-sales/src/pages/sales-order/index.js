import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import toast from 'react-hot-toast'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import SalesOrderForm from '@argus/shared-ui/src/components/Shared/Forms/SalesOrderForm'
import { useError } from '@argus/shared-providers/src/providers/error'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const SalesOrder = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults } = useContext(DefaultsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

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
    endpointId: SaleRepository.SalesOrder.page,
    datasetId: ResourceIds.SalesOrder,
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
      field: 'clientName',
      headerName: labels.client,
      flex: 1
    },
    {
      field: 'spRef',
      headerName: labels.salesPerson,
      flex: 1
    },
    {
      field: 'szName',
      headerName: labels.saleZone,
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
      field: 'dsName',
      headerName: labels.deliveryStatus,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: labels.releaseStatus,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wip,
      flex: 1
    },
    {
      field: 'printStatusName',
      headerName: labels.printStatus,
      flex: 1
    },
    {
      field: 'description',
      headerName: labels.description,
      flex: 1
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: SaleRepository.SalesOrder.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_sortBy=recordId desc&_params=${params}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: SaleRepository.SalesOrder.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  async function getDefaultSalesCurrency() {
    const defaultCurrency = systemDefaults?.list?.find(({ key }) => key === 'currencyId')

    return parseInt(defaultCurrency?.value)
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.SalesOrder,
    action: async () => {
      const currency = await getDefaultSalesCurrency()
      currency
        ? openForm()
        : stackError({
            message: labels.noSelectedCurrency
          })
    }
  })

  const add = async () => {
    proxyAction()
  }

  const editSO = obj => {
    openForm(obj?.recordId)
  }

  async function openForm(recordId) {
    const currency = await getDefaultSalesCurrency()
    stack({
      Component: SalesOrderForm,
      props: {
        currency,
        recordId
      }
    })
  }

  const delSO = async obj => {
    await postRequest({
      extension: SaleRepository.SalesOrder.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'SAORD'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={editSO}
          refetch={refetch}
          onDelete={delSO}
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

export default SalesOrder
