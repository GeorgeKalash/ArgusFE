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
import { ControlContext } from 'src/providers/ControlContext'
import CountryRiskLevelForm from './Forms/CountryRiskLevelForm'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

const CountryRiskLevel = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: RemittanceSettingsRepository.CountryRisk.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceSettingsRepository.CountryRisk.page,
    datasetId: ResourceIds.CountryRiskLevel
  })

  const columns = [
    {
      field: 'countryRef',
      headerName: _labels.countryRef,
      flex: 1
    },
    {
      field: 'countryName',
      headerName: _labels.countryName,
      flex: 1
    },
    {
      field: 'riskLevelName',
      headerName: _labels.riskLevelName,
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
    console.log(recordId)
    stack({
      Component: CountryRiskLevelForm,
      props: {
        labels: _labels,
        recordId,
        maxAccess: access
      },
      width: 500,
      height: 300,
      title: _labels.countryRiskLevel
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
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default CountryRiskLevel
