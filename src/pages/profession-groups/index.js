import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import ProfessionGroupsForm from './forms/ProfessionGroupsForm'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ControlContext } from 'src/providers/ControlContext'

const ProfessionGroups = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: RemittanceSettingsRepository.ProfessionGroups.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    filterBy,
    clearFilter,
    invalidate,
    labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceSettingsRepository.ProfessionGroups.page,
    datasetId: ResourceIds.ProfessionGroups,
    filter: {
      endpointId: RemittanceSettingsRepository.ProfessionGroups.snapshot,
      filterFn: fetchWithSearch
    }
  })
  async function fetchWithSearch({ filters }) {
    return await getRequest({
      extension: RemittanceSettingsRepository.ProfessionGroups.snapshot,
      parameters: `_filter=${filters.qry}`
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

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: ProfessionGroupsForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 600,
      height: 330,
      title: labels.professionGroups
    })
  }

  const del = async obj => {
    await postRequest({
      extension: RemittanceSettingsRepository.ProfessionGroups.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          inputSearch={true}
        />
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
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>{' '}
    </VertLayout>
  )
}

export default ProfessionGroups
