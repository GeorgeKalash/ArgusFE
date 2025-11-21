import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import MasterDataDTDForm from './Form/MasterDataDTDForm'
import { CurrencyTradingSettingsRepository } from '@argus/repositories/src/repositories/CurrencyTradingSettingsRepository'

const MasterDataDTD = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: CurrencyTradingSettingsRepository.MasterDataDTD.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })

    return { ...response, _startAt: _startAt }
  }
  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: CurrencyTradingSettingsRepository.MasterDataDTD.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  const {
    query: { data },
    search,
    clear,
    labels,
    paginationParameters,
    refetch,
    invalidate,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CurrencyTradingSettingsRepository.MasterDataDTD.page,
    datasetId: ResourceIds.MasterDataDTD,
    search: {
      searchFn: fetchWithSearch
    }
  })

  const columns = [
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
      Component: MasterDataDTDForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 500,
      height: 250,
      title: labels.MasterDataDTD
    })
  }

  const del = async obj => {
    await postRequest({
      extension: CurrencyTradingSettingsRepository.MasterDataDTD.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} onSearch={search} onSearchClear={clear} inputSearch={true} />
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
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default MasterDataDTD
