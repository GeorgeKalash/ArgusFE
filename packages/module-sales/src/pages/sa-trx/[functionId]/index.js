import { Grow } from '@mui/material'
import React, { useContext } from 'react'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { useError } from '@argus/shared-providers/src/providers/error'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import SaleTransactionForm from '@argus/shared-ui/src/components/Shared/Forms/SaleTransactionForm'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import toast from 'react-hot-toast'
import NormalDialog from '@argus/shared-ui/src/components/Shared/NormalDialog'
import { Router } from '@argus/shared-domain/src/lib/useRouter'
import { LockedScreensContext } from '@argus/shared-providers/src/providers/LockedScreensContext'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const SaTrx = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults } = useContext(DefaultsContext)
  const { stack, lockRecord } = useWindow()
  const { stack: stackError } = useError()
  const { addLockedScreen } = useContext(LockedScreensContext)

  const { functionId } = Router()

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.SalesInvoice:
        return ResourceIds.SalesInvoice
      case SystemFunction.SalesReturn:
        return ResourceIds.SaleReturn
      case SystemFunction.ConsignmentIn:
        return ResourceIds.ClientGOCIn
      case SystemFunction.ConsignmentOut:
        return ResourceIds.ClientGOCOut
      default:
        return null
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
    endpointId: SaleRepository.SalesTransaction.qry,
    datasetId: ResourceIds.SalesInvoice,
    DatasetIdAccess: getResourceId(parseInt(functionId)),
    filter: {
      filterFn: fetchWithFilter,
      default: { functionId }
    }
  })

  const columns = [
    {
      field: 'plantName',
      headerName: labels.plant,
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
      field: 'clientRef',
      headerName: labels.clientRef,
      flex: 1
    },
    {
      field: 'clientName',
      headerName: labels.clientName,
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
      field: 'volume',
      headerName: labels.volume,
      flex: 1,
      type: 'number'
    },
    {
      field: 'amount',
      headerName: labels.net,
      flex: 1,
      type: { field: 'number', decimal: 2 }
    },
    {
      field: 'spName',
      headerName: labels.salesPerson,
      flex: 1
    },
    {
      field: 'szName',
      headerName: labels.saleZone,
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
      flex: 2
    },
    {
      field: 'isVerified',
      headerName: labels.isVerified,
      type: 'checkbox'
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: SaleRepository.SalesTransaction.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_sortBy=recordId desc&_params=${params}&_dgId=${functionId}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: SaleRepository.SalesTransaction.snapshot,
        parameters: `_filter=${filters.qry}&_dgId=${functionId}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  async function getDefaultSalesCurrency() {
    const defaultCurrency = systemDefaults?.list?.find(({ key }) => key === 'currencyId')

    return defaultCurrency?.value ? parseInt(defaultCurrency.value) : null
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
    openForm(obj?.recordId, obj?.reference, obj?.status)
  }

  const getCorrectLabel = functionId => {
    if (functionId === SystemFunction.SalesInvoice) {
      return labels.salesInvoice
    } else if (functionId === SystemFunction.SalesReturn) {
      return labels.salesReturn
    } else if (functionId === SystemFunction.ConsignmentIn) {
      return labels.consignmentIn
    } else if (functionId === SystemFunction.ConsignmentOut) {
      return labels.consignmentOut
    } else {
      return null
    }
  }

  const getGLResource = functionId => {
    const fn = Number(functionId)
    switch (fn) {
      case SystemFunction.SalesInvoice:
        return ResourceIds.GLSalesInvoice
      case SystemFunction.SalesReturn:
        return ResourceIds.GLSalesReturn
      default:
        return null
    }
  }

  function openStack(recordId) {
    stack({
      Component: SaleTransactionForm,
      props: {
        labels,
        recordId,
        access,
        functionId,
        lockRecord,
        getResourceId,
        getGLResource
      },
     
      title: getCorrectLabel(parseInt(functionId))
    })
  }

  async function openForm(recordId, reference, status) {
    if (recordId && status !== 3) {
      await lockRecord({
        recordId: recordId,
        reference: reference,
        resourceId: getResourceId(parseInt(functionId)),
        onSuccess: () => {
          addLockedScreen({
            resourceId: getResourceId(parseInt(functionId)),
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

  const add = async () => {
    await proxyAction()
  }

  const del = async obj => {
    await postRequest({
      extension: SaleRepository.SalesTransaction.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'SATR'} filterBy={filterBy} />
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

export default SaTrx
