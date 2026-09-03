import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import BudgetForm from './Forms/BudgetForm'

export default function MFBudget () {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options
    const response = await getRequest({
      extension: ManufacturingRepository.Budget.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=`
    })
    return { ...response, _startAt }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access: maxAccess,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.Budget.page,
    datasetId: ResourceIds.Budget
  })

  const columns = [
    { field: 'fiscalYear', headerName: labels.fiscalYear, flex: 1 },
    { field: 'periodName', headerName: labels.period, flex: 1 },
    { field: 'metalRef', headerName: labels.metal, flex: 1 },
    { field: 'itemGroupRef', headerName: labels.itemGroup, flex: 1 },
    { field: 'collectionRef', headerName: labels.collection, flex: 1 },
    { field: 'qtyPct', headerName: labels.qtyPct, flex: 1, type: 'number' }
  ]

  const add = () => openForm()
  const edit = obj => openForm(obj)

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.Budget.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(obj) {
    stack({
      Component: BudgetForm,
      props: {
        labels,
        record: obj,
        recordId: obj
            ? String(obj.fiscalYear * 100) + String(obj.periodId * 10) + String(obj.seqNo)
            : null,
        maxAccess,
        invalidate
      },
      width: 550,
      height: 450,
      title: labels.budget
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} labels={labels} inputSearch={false} />
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