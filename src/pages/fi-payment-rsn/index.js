import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import PaymentReasonsForm from './Forms/PaymentReasonsForm'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

const PaymentReasons = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FinancialRepository.PaymentReasons.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_sortField=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    invalidate,
    paginationParameters,
    refetch,
    search,
    clear,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.PaymentReasons.page,
    datasetId: ResourceIds.PaymentReasons,
    search: {
      endpointId: FinancialRepository.PaymentReasons.snapshot,
      searchFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: FinancialRepository.PaymentReasons.snapshot,
      parameters: `_filter=${qry}`
    })
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: FinancialRepository.PaymentReasons.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: PaymentReasonsForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 600,
      height: 300,
      title: labels.paymentReasons
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
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
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default PaymentReasons
