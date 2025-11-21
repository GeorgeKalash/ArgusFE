import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import AgingForm from './forms/AgingForm'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const AgingProfile = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FinancialRepository.AgingProfile.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.AgingProfile.qry,
    datasetId: ResourceIds.FIAgingProfile
  })

  const columns = [
    {
      field: 'name',
      headerName: _labels.reference,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId, obj?.name)
  }

  function openForm(recordId, name) {
    stack({
      Component: AgingForm,
      props: {
        labels: _labels,
        recordId: recordId,
        name: name || '',
        maxAccess: access
      },
      width: 600,
      height: 370,
      title: _labels.aging
    })
  }

  const del = async obj => {
    await postRequest({
      extension: FinancialRepository.AgingProfile.del,
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
          refetch={refetch}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default AgingProfile
