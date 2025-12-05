import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { useInvalidate, useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ExpenseTypesForms from './Forms/ExpenseTypesForm'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const ExpenseTypes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FinancialRepository.ExpenseTypes.page,
      parameters: `_pageSize=${_pageSize}&_startAt=${_startAt}&_filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.ExpenseTypes.page
  })

  const {
    query: { data },
    labels: _labels,
    access,
    search,
    clear,
    paginationParameters,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.ExpenseTypes.page,
    datasetId: ResourceIds.Expense_Types,
    search: {
      endpointId: FinancialRepository.ExpenseTypes.snapshot,
      searchFn: fetchWithSearch
    }
  })
  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: FinancialRepository.ExpenseTypes.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'description',
      headerName: _labels.description,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: FinancialRepository.ExpenseTypes.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: ExpenseTypesForms,
      props: {
        labels: _labels,
        recordId,
        maxAccess: access,
        invalidate: invalidate
      },
      width: 600,
      height: 400,
      title: _labels.expenseType
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          labels={_labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          paginationParameters={paginationParameters}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default ExpenseTypes
