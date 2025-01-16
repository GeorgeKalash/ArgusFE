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
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import DeliveryLeadTimeForm from './Forms.js/DeliveryLeadTime'

const DeliveryLeadTime = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: DeliveryRepository.DeliveryLeadTime.qry,
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
    endpointId: DeliveryRepository.DeliveryLeadTime.qry,
    datasetId: ResourceIds.DeliveryLeadTimes
  })

  const columns = [
    {
      field: 'szRef',
      headerName: _labels.saleZoneRef,
      flex: 1
    },
    {
      field: 'szName',
      headerName: _labels.saleZoneName,
      flex: 1
    },
    {
      field: 'leadTimeInDays',
      headerName: _labels.leadTimeInDays,
      flex: 1
    },
    {
      field: 'smsTemplateName',
      headerName: _labels.smsTemplateName,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.szId)
  }

  function openForm(recordId) {
    stack({
      Component: DeliveryLeadTimeForm,
      props: {
        labels: _labels,
        recordId,
        maxAccess: access
      },
      width: 600,
      height: 500,
      title: _labels.LeadTime
    })
  }

  const del = async obj => {
    await postRequest({
      extension: DeliveryRepository.DeliveryLeadTime.del,
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

export default DeliveryLeadTime
