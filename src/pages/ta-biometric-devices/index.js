import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'
import { useWindow } from 'src/windows'
import { TimeAttendanceRepository } from 'src/repositories/TimeAttendanceRepository'
import BiometricDevicesForm from './Form/BiometricDevicesForm'
import GridToolbar from 'src/components/Shared/GridToolbar'

const BiometricDevices = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: TimeAttendanceRepository.BiometricDevices.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    access,
    paginationParameters,
    refetch,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: TimeAttendanceRepository.BiometricDevices.page,
    datasetId: ResourceIds.BiometricDevices
  })

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

  function openForm(recordId) {
    stack({
      Component: BiometricDevicesForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 600,
      height: 400,
      title: labels.BiometricDevice
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: TimeAttendanceRepository.BiometricDevices.del,
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
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default BiometricDevices
