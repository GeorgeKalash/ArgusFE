import { Grow } from '@mui/material'
import React, { useContext, useEffect, useRef } from 'react'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { useError } from 'src/error'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { PointofSaleRepository } from 'src/repositories/PointofSaleRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useWindow } from 'src/windows'
import RetailTransactionsForm from './forms/RetailTransactionsForm'
import { useResourceQuery } from 'src/hooks/resource'
import Table from 'src/components/Shared/Table'
import toast from 'react-hot-toast'
import { getStorageData } from 'src/storage/storage'
import { Router } from 'src/lib/useRouter'

const RetailTrx = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  const { functionId } = Router()

  const userId = getStorageData('userData')?.userId
  const posObj = useRef(null)

  const getResourceId = {
    [SystemFunction.RetailInvoice]: ResourceIds.RetailInvoice,
    [SystemFunction.RetailReturn]: ResourceIds.RetailInvoiceReturn,
    [SystemFunction.RetailPurchase]: ResourceIds.RetailPurchase
  }

  const {
    query: { data },
    filterBy,
    refetch,
    clearFilter,
    labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    enabled: !!posObj?.current?.posId,
    queryFn: fetchGridData,
    endpointId: PointofSaleRepository.RetailInvoice.qry,
    datasetId: ResourceIds.RetailInvoice,
    DatasetIdAccess: getResourceId[parseInt(functionId)],
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
      headerName: labels.documentType,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
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
      extension: PointofSaleRepository.RetailInvoice.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}&_functionId=${functionId}&_posId=${posObj?.current?.posId}&_filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function getDefaultCountry() {
    const defaultCountry = defaultsData?.list?.find(({ key }) => key === 'countryId')

    return parseInt(defaultCountry?.value)
  }

  async function getPOSUser() {
    return await getRequest({
      extension: PointofSaleRepository.PosUsers.get,
      parameters: `_userId=${userId}`
    })
  }

  async function getIsActivePOS() {
    if (!posObj?.current?.posId) return

    return await getRequest({
      extension: PointofSaleRepository.PointOfSales.get,
      parameters: `_recordId=${posObj?.current?.posId}`
    })
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: PointofSaleRepository.RetailInvoice.snapshot,
        parameters: `_filter=${filters.qry}&_functionId=${functionId}&_posId=${posObj?.current?.posId}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: posObj?.current?.posId ? functionId : null,
    action: async () => {
      if (!posObj?.current?.posId) {
        stackError({
          message: labels.noUserPos
        })

        return
      }
      const country = await getDefaultCountry()
      if (!country) {
        stackError({
          message: labels.noSelectedCountry
        })

        return
      }
      const isActivePOS = await getIsActivePOS()
      if (isActivePOS?.record.isInactive) {
        stackError({
          message: labels.InactivePos
        })

        return
      }
      openForm()
    },
    hasDT: false
  })

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const getCorrectLabel = functionId => {
    if (functionId === SystemFunction.RetailInvoice) {
      return labels.RetailInvoice
    } else if (functionId === SystemFunction.RetailReturn) {
      return labels.RetailReturn
    } else if (functionId === SystemFunction.RetailPurchase) {
      return labels.RetailPurchase
    }
  }

  async function openForm(recordId) {
    stack({
      Component: RetailTransactionsForm,
      props: {
        labels,
        recordId,
        access,
        posUser: posObj?.current,
        functionId
      },
      width: 1200,
      height: 725,
      title: getCorrectLabel(parseInt(functionId))
    })
  }

  const add = async () => {
    await proxyAction()
  }

  const del = async obj => {
    await postRequest({
      extension: PointofSaleRepository.RetailInvoice.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const onApply = ({ search, rpbParams }) => {
    if (!search && rpbParams.length === 0) {
      clearFilter('params')
    } else if (!search) {
      filterBy('params', rpbParams)
    } else {
      filterBy('qry', search)
    }
    refetch()
  }

  const onSearch = value => {
    filterBy('qry', value)
  }

  const onClear = () => {
    clearFilter('qry')
  }

  async function fetchPOSInfo() {
    const posInfo = await getPOSUser()
    posObj.current = posInfo?.record
  }

  useEffect(() => {
    ;(async function () {
      await fetchPOSInfo()
    })()
  }, [])

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onAdd={add}
          maxAccess={access}
          onApply={onApply}
          onSearch={onSearch}
          onClear={onClear}
          reportName={'PSIVC'}
        />
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

export default RetailTrx
