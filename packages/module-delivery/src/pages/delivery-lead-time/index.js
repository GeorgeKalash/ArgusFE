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
import { DeliveryRepository } from '@argus/repositories/src/repositories/DeliveryRepository'
import DeliveryLeadTimeForm from './Forms.js/DeliveryLeadTime'

const DeliveryLeadTime = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: DeliveryRepository.DeliveryLeadTime.page,
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
    endpointId: DeliveryRepository.DeliveryLeadTime.page,
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
