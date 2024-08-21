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
import { ControlContext } from 'src/providers/ControlContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { useError } from 'src/error'
import { SystemRepository } from 'src/repositories/SystemRepository'
import FiPaymentVoucherExpensesForm from './forms/PaymentVoucherExpensesForm'
import { getStorageData } from 'src/storage/storage'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const FiPaymentVouchers = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: FinancialRepository.PaymentVouchers.page,
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
    labels: _labels,
    filterBy,
    clearFilter,
    paginationParameters,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.PaymentVouchers.page,
    datasetId: ResourceIds.PaymentVoucherExpenses,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'accountTypeName',
      headerName: _labels.accountType,
      flex: 1
    },
    {
      field: 'accountRef',
      headerName: _labels.account,
      flex: 1
    },
    {
      field: 'accountName',
      headerName: _labels.accountName,
      flex: 1
    },
    {
      field: 'cashAccountName',
      headerName: _labels.cashAccount,
      flex: 1
    },
    {
      field: 'amount',
      headerName: _labels.amount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'currencyRef',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'notes',
      headerName: _labels.notes,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    },
    {
      field: 'isVerified',
      headerName: _labels.isVerified,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const getPlantId = async () => {
    const userId = getStorageData('userData').userId

    try {
      const res = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${userId}&_key=plantId`
      })

      return res.record.value
    } catch (e) {}
  }

  function openOutWardsWindow(plantId, recordId) {
    stack({
      Component: FiPaymentVoucherExpensesForm,
      props: {
        labels: _labels,
        recordId,
        plantId,
        maxAccess: access
      },
      width: 1300,
      height: 700,
      title: _labels.paymentVoucherExpenses
    })
  }

  async function openForm(recordId) {
    const plantId = await getPlantId()

    plantId !== ''
      ? openOutWardsWindow(plantId, recordId)
      : stackError({
          message: platformLabels.noDefaultPlant
        })
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: FinancialRepository.PaymentVouchers.del,
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
          onSearch={onSearch}
          onClear={onClear} 
          labels={_labels} 
          onAdd={add}
          maxAccess={access} 
          onApply={onApply} 
          reportName={'FIPV'} 
        />
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
