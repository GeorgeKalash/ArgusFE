import { Grow } from '@mui/material'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { useError } from 'src/error'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useWindow } from 'src/windows'
import SaleTransactionForm from './forms/SaleTransactionForm'
import { useResourceQuery } from 'src/hooks/resource'
import Table from 'src/components/Shared/Table'
import toast from 'react-hot-toast'
import NormalDialog from 'src/components/Shared/NormalDialog'
import { Router } from 'src/lib/useRouter'

const SaTrx = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const { stack, lockRecord } = useWindow()
  const { stack: stackError } = useError()

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
    clearFilter,
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
    const defaultCurrency = defaultsData?.list?.find(({ key }) => key === 'currencyId')

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
      width: 1330,
      height: 720,
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
