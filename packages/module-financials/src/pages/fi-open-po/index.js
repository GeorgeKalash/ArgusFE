import { useContext, useState } from 'react'
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
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import PaymentOrdersExpensesForm from '../fi-po-expenses/Form/PaymentOrdersExpensesForm'
import { useError } from '@argus/shared-providers/src/providers/error'
import FiPaymentVouchersForm from '../fi-payment-vouchers/forms/FiPaymentVouchersForm'
import FiPaymentVoucherExpensesForm from '../fi-pv-expenses/forms/PaymentVoucherExpensesForm'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import PaymentOrdersForm from '@argus/shared-ui/src/components/Shared/Forms/PaymentOrdersForm'

const OpenPaymentOrder = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [record, setRecord] = useState()
  const { stack: stackError } = useError()

  async function fetchGridData(options = {}) {
    const { params } = options

    const response = await getRequest({
      extension: FinancialRepository.PaymentOrders.open,
      parameters: `_params=${params || ''}&_filter=`
    })

    return { ...response }
  }

  async function fetchWithFilter({ filters }) {
    if (filters?.qry) {
      return await getRequest({
        extension: FinancialRepository.PaymentOrders.open,
        parameters: `_filter=${filters.qry}&_params=`
      })
    } else {
      return fetchGridData({ params: filters?.params })
    }
  }

  const {
    query: { data },
    labels,
    filterBy,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.PaymentOrders.page2,
    datasetId: ResourceIds.OpenPaymentOrder,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'plantName',
      headerName: labels.plantName,
      flex: 1
    },
    {
      field: 'accountTypeName',
      headerName: labels.accountType,
      flex: 1
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
      field: 'cashAccountName',
      headerName: labels.cashAccount,
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
      field: 'currencyRef',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  function openForm(obj) {
    const { recordId, accountType } = obj

    stack({
      Component: accountType !== 3 ? PaymentOrdersForm : PaymentOrdersExpensesForm,
      props: {
        recordId
      }
    })
  }

  const generatePV = async record => {
    if (!record?.checked) {
      stackError({
        message: platformLabels.selectRow
      })

      return
    } else {
      postRequest({
        extension: FinancialRepository.PaymentOrders.generate,
        record: JSON.stringify(record)
      }).then(async res => {
        toast.success(platformLabels.Generated)

        if (res.recordId) {
          const data = await getRequest({
            extension: FinancialRepository.PaymentVouchers.get,
            parameters: `_recordId=${res.recordId}`
          })

          stack({
            Component: data.record.accountType !== 3 ? FiPaymentVouchersForm : FiPaymentVoucherExpensesForm,
            props: {
              recordId: res.recordId
            }
          })
        }
        invalidate()
      })
    }
  }

  const actions = [
    {
      key: 'PV',
      condition: true,
      onClick: () => generatePV(record),
      disabled: false
    }
  ]

  return (
    <Form actions={actions} onSave={() => generatePV(record)} isSaved={false} maxAccess={access} fullSize>
      <VertLayout>
        <Fixed>
          <RPBGridToolbar labels={labels} maxAccess={access} reportName={'FIPO2'} filterBy={filterBy} />
        </Fixed>
        <Grow>
          <Table
            name='table'
            columns={columns}
            gridData={data}
            showCheckboxColumn={true}
            rowId={['recordId']}
            rowSelection='single'
            handleCheckboxChange={(data, checked) => {
              setRecord(checked ? data : {})
            }}
            onEdit={edit}
            pagination={false}
            refetch={refetch}
            maxAccess={access}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default OpenPaymentOrder
