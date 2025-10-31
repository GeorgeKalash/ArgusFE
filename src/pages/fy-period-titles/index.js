import { useContext } from 'react'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import toast from 'react-hot-toast'
import PeriodTitlesForm from './Forms/PeriodTitlesForm'

const FaFiscalPeriodTitle = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: SystemRepository.FiscalPeriod.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    access,
    invalidate,
    refetch,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.FiscalPeriod.page,
    datasetId: ResourceIds.FiscalPeriod
  })

  const columns = [
    {
      field: 'periodId',
      headerName: labels.periodId,
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
    openForm(obj?.periodId)
  }

  const del = async obj => {
    await postRequest({
      extension: SystemRepository.FiscalPeriod.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: PeriodTitlesForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 600,
      height: 350,
      title: labels?.FiscalPeriodTitle
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
          rowId={['periodId']}
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

export default FaFiscalPeriodTitle
