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
import { useRouter } from 'next/router'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ControlContext } from 'src/providers/ControlContext'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import MetalTrxFinancialForm from './form/MetalTrxFinancialForm'

const MetalTrxFinancial = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const router = useRouter()
  const { functionId } = router.query

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
        return null
    }
  }

  const {
    query: { data },
    refetch,
    labels: _labels,
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
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'dtName',
      headerName: _labels.docType,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },

    {
      field: 'plantName',
      headerName: _labels.plant,
      flex: 1
    },
    {
      field: 'siteRef',
      headerName: _labels.siteRef,
      flex: 1
    },
    {
      field: 'accountRef',
      headerName: _labels.accountRef,
      flex: 1
    },
    {
      field: 'accountName',
      headerName: _labels.accountRef,
      flex: 1
    },
    {
      field: 'qty',
      headerName: _labels.qty,
      flex: 1
    },
    {
      field: 'creditAmount',
      headerName: _labels.creditAmount,
      flex: 1
    },

    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj?.recordId, obj?.date)
  }

  const getcorrectLabel = functionId => {
    if (functionId === SystemFunction.MetalReceiptVoucher) {
      return _labels.metalReceipt
    } else if (functionId === SystemFunction.MetalPaymentVoucher) {
      return _labels.metalPayment
    } else {
      return null
    }
  }

  function openForm(recordId, date) {
    stack({
      Component: MetalTrxFinancialForm,
      props: {
        labels: _labels,
        recordId: recordId,
        date,
        access,
        functionId: functionId
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
    try {
      await postRequest({
        extension: FinancialRepository.MetalTrx.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
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

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onAdd={add}
          maxAccess={access}
          onApply={onApply}
          onSearch={onSearch}
          onClear={onClear}
          reportName={'FIMTX'}
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

export default MetalTrxFinancial
