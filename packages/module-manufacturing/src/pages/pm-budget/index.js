import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { ProductModelingRepository } from '@argus/repositories/src/repositories/ProductModelingRepository'
import PmBudgetForm from './Forms/PmBudgetForm'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'

export default function PMBudget () {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options
    const response = await getRequest({
      extension: ProductModelingRepository.Budget.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })
    return { ...response, _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    filterBy,
    labels,
    paginationParameters,
    refetch,
    access: maxAccess,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ProductModelingRepository.Budget.page,
    datasetId: ResourceIds.PM_Budget,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    { field: 'fiscalYear', headerName: labels.fiscalYear, flex: 1 },
    { field: 'developerRef', headerName: labels.developerRef, flex: 1 },
    { field: 'developerName', headerName: labels.developerName, flex: 1 },
    { field: 'periodName', headerName: labels.period, flex: 1 },
    { field: 'designCount', headerName: labels.designCount, flex: 1, type: 'number' }
  ]

  const add = () => openForm()
  const edit = obj => openForm(obj?.recordId)

  const del = async obj => {
    await postRequest({
      extension: ProductModelingRepository.Budget.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: PmBudgetForm,
      props: {
        labels,
        recordId,
        maxAccess
      },
      width: 1000,
      height: 560,
      title: labels.budget
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={maxAccess} reportName={'PMBUD'} inputSearch={false} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}