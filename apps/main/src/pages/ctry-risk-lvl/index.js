import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CountryRiskLevelForm from './Forms/CountryRiskLevelForm'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'

const CountryRiskLevel = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: RemittanceSettingsRepository.CountryRisk.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    filterBy,
    refetch,
    invalidate,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceSettingsRepository.CountryRisk.page,
    datasetId: ResourceIds.CountryRiskLevel,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'countryRef',
      headerName: labels.countryRef,
      flex: 1
    },
    {
      field: 'countryName',
      headerName: labels.countryName,
      flex: 1
    },
    {
      field: 'riskLevelName',
      headerName: labels.riskLevelName,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.countryId)
  }

  function openForm(recordId) {
    stack({
      Component: CountryRiskLevelForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 500,
      height: 300,
      title: labels.countryRiskLevel
    })
  }

  const del = async obj => {
    await postRequest({
      extension: RemittanceSettingsRepository.CountryRisk.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'RTCOU'} />
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

export default CountryRiskLevel
