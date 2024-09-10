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
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import FeeScheduleInwardsMapForm from './Forms/FeeScheduleInwardsMapForm'

const FeeScheduleInwardsMap = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData() {
    return await getRequest({
      extension: RemittanceOutwardsRepository.FeeScheduleInwards.qry
    })
  }

  const {
    query: { data },
    labels: _labels,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceOutwardsRepository.FeeScheduleInwards.qry,
    datasetId: ResourceIds.FeeScheduleInwardsMap
  })

  const columns = [
    {
      field: 'corRef',
      headerName: _labels.corRef,
      flex: 1
    },
    {
      field: 'corName',
      headerName: _labels.corName,
      flex: 1
    },
    {
      field: 'dispersalModeName',
      headerName: _labels.dispersalMode,
      flex: 1
    },
    {
      field: 'scheduleName',
      headerName: _labels.schedule,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: RemittanceOutwardsRepository.FeeScheduleInwards.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (exception) {}
  }

  function openForm(record) {
    stack({
      Component: FeeScheduleInwardsMapForm,
      props: {
        labels: _labels,
        record,
        maxAccess: access,
        recordId: record
          ? String(record.corId) +
            String(record.dispersalMode)
          : null
      },
      width: 700,
      height: 350,
      title: _labels.fsim
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
          rowId={['corId, functionId, dispersalMode']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationType='client'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default FeeScheduleInwardsMap
