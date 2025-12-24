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
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import FiPaymentVouchersForm from './forms/FiPaymentVouchersForm'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'

const FiPaymentVouchers = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: FinancialRepository.PaymentVouchers.page3,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&filter=`
    })

    if (response && response?.list) {
      response.list = response?.list?.map(item => ({
        ...item,
        isVerified: item?.isVerified === null ? false : item?.isVerified
      }))
    }

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: FinancialRepository.PaymentVouchers.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const {
    query: { data },
    labels,
    filterBy,
    paginationParameters,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.PaymentVouchers.page3,
    datasetId: ResourceIds.PaymentVouchers,
    filter: {
      filterFn: fetchWithFilter
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
      field: 'accountRef',
      headerName: labels.account,
      flex: 1
    },
    {
      field: 'accountName',
      headerName: labels.accountName,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'paymentMethodName',
      headerName: labels.paymentMethod,
      flex: 1
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1,
      type: 'number'
    },

    {
      field: 'cashAccountName',
      headerName: labels.cashAccount,
      flex: 1
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
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

  const add = async () => {
    await proxyAction()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openOutWardsWindow(recordId) {
    stack({
      Component: FiPaymentVouchersForm,
      props: {
        recordId
      },
    })
  }

  async function openForm(recordId) {
    openOutWardsWindow(recordId)
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.PaymentVoucher,
    action: openForm
  })

  const del = async obj => {
    await postRequest({
      extension: FinancialRepository.PaymentVouchers.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar labels={labels} onAdd={add} maxAccess={access} reportName={'FIPV'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          deleteConfirmationType={'strict'}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default FiPaymentVouchers