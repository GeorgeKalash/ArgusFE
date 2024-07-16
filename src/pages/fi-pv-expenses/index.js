import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
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

const FiPaymentVouchers = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FinancialRepository.PaymentVouchers.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.PaymentVouchers.page,
    datasetId: ResourceIds.PaymentVoucherExpenses
  })

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.PaymentVouchers.page
  })

  const columns = [
    {
        field: 'reference',
        headerName: _labels.reference,
        flex: 1
    },
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const getPlantId = async () => {
    const userData = window.sessionStorage.getItem('userData')
      ? JSON.parse(window.sessionStorage.getItem('userData'))
      : null

    const parameters = `_userId=${userData && userData.userId}&_key=plantId`

    return getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: parameters
    })
      .then(res => res.record.value)
      .catch(error => {})
  }

  function openOutWardsWindow(plantId, recordId) {
    stack({
      Component: FiPaymentVoucherExpensesForm,
      props: {
        labels: _labels,
        recordId: recordId,
        plantId: plantId,
        maxAccess: access
      },
      width: 1300,
      height: 700,
      title: _labels.paymentVoucher
    })
  }

  async function openForm(recordId) {
    try {
      const plantId = await getPlantId()
      if (plantId !== '') {
        openOutWardsWindow(plantId, recordId)
      } else {
        if (plantId === '') {
          stackError({
            message: `The user does not have a default plant.`
          })
        }
      }
    } catch (error) {}

  }

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
        <GridToolbar onAdd={add} maxAccess={access} />
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