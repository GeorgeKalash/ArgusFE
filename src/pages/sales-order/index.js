import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import GridToolbar from 'src/components/Shared/GridToolbar'
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
import { SaleRepository } from 'src/repositories/SaleRepository'
import SalesOrderForm from './Tabs/SalesOrderForm'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getStorageData } from 'src/storage/storage'
import { useError } from 'src/error'

const SalesOrder = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const userId = getStorageData('userData').userId

  const {
    query: { data },
    labels: labels,
    paginationParameters,
    search,
    refetch,
    clear,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.SalesOrder.page,
    datasetId: ResourceIds.SalesOrder,
    search: {
      endpointId: SaleRepository.SalesOrder.snapshot,
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
      headerName: labels.salesZone,
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
      headerName: labels.amount,
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
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: SaleRepository.SalesOrder.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_sortBy=recordId desc&_params=&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: SaleRepository.SalesOrder.snapshot,
      parameters: `_filter=${qry}`
    })
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
    },
    hasDT: false
  })

  const add = async () => {
    proxyAction()
  }

  const editSO = obj => {
    openForm(obj.recordId)
  }

  async function getDefaultUserSite() {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${userId}&_key=siteId`
      })

      return res?.record?.value
    } catch (error) {
      return ''
    }
  }

  async function getDefaultPUSite() {
    try {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: `_filter=&_key=PUSiteId`
      })

      return res?.record?.value
    } catch (error) {
      return ''
    }
  }

  async function getDefaultSalesTD() {
    try {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: `_filter=&_key=salesTD`
      })

      return res?.record?.value
    } catch (error) {
      return ''
    }
  }

  async function getDefaultSalesCurrency() {
    try {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: `_filter=&_key=currencyId`
      })

      return res?.record?.value
    } catch (error) {
      return ''
    }
  }

  async function openForm(recordId) {
    const userDefaultSite = await getDefaultUserSite()
    const userDefaultPUSite = await getDefaultPUSite()
    const defaultSalesTD = await getDefaultSalesTD()
    const siteId = userDefaultSite ? userDefaultSite : userDefaultPUSite
    const currency = await getDefaultSalesCurrency()

    stack({
      Component: SalesOrderForm,
      props: {
        labels,
        access,
        siteId,
        defaultSalesTD,
        currency,
        recordId
      },
      width: 1200,
      height: 730,
      title: labels.salesOrder
    })
  }

  const delSO = async obj => {
    try {
      await postRequest({
        extension: SaleRepository.SalesOrder.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          maxAccess={access}
          onAdd={add}
          onSearch={search}
          onSearchClear={clear}
          labels={labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={editSO}
          refetch={refetch}
          onDelete={delSO}
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
