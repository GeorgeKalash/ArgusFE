import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import IntegrationLogicWindow from './Windows/IntegrationLogicWindow'
import { useWindow } from 'src/windows'

const GLIntegrationLogic = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: GeneralLedgerRepository.IntegrationLogic.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options
    try {
      const response = await getRequest({
        extension: GeneralLedgerRepository.IntegrationLogic.page,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
      })

      return { ...response, _startAt: _startAt }
    } catch (error) {}
  }

  const {
    query: { data },
    labels: _labels,
    access,
    invalidate,
    refetch,
    search,
    clear,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: GeneralLedgerRepository.IntegrationLogic.page,
    datasetId: ResourceIds.IntegrationLogics,
    search: {
      searchFn: fetchWithSearch
    }
  })

  const columns = [
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
        extension: GeneralLedgerRepository.IntegrationLogic.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (exception) {}
  }

  function openForm(recordId) {
    stack({
      Component: IntegrationLogicWindow,
      props: {
        labels: _labels,
        recordId,
        maxAccess: access
      },
      width: 1100,
      height: 500,
      title: _labels.integrationLogic
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
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
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

export default GLIntegrationLogic
