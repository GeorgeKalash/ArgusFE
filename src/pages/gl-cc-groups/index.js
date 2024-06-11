import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import CostCenterGroupForm from './forms/CostCenterGroupForm'
import { ControlContext } from 'src/providers/ControlContext'

const CostCenterGroup = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: GeneralLedgerRepository.CostCenterGroup.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    invalidate,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: GeneralLedgerRepository.CostCenterGroup.page,
    datasetId: ResourceIds.CostCenterGroup
  })

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
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: GeneralLedgerRepository.CostCenterGroup.del,
        record: JSON.stringify(obj)
      })
      toast.success(platformLabels.Deleted)
      invalidate()
    } catch (error) {}
  }
  function openForm(recordId) {
    stack({
      Component: CostCenterGroupForm,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 600,
      height: 250,
      title: _labels.costCenter
    })
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
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
        />
      </Grow>
    </VertLayout>
  )
}

export default CostCenterGroup
