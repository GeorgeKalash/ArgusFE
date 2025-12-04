import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import OutwardsForm from '@argus/shared-ui/src/components/Shared/Forms/OutwardsForm'
import { RemittanceOutwardsRepository } from '@argus/repositories/src/repositories/RemittanceOutwardsRepository'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'

const OutwardsOrder = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const userData = getStorageData('userData')

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    if (params) {
      const response = await getRequest({
        extension: RemittanceOutwardsRepository.OutwardsOrder.page,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_params=${params || ''}`
      })

      return { ...response, _startAt: _startAt }
    } else return { list: [], _startAt: 0 }
  }

  const {
    query: { data },
    filterBy,
    refetch,
    labels: _labels,
    access,
    invalidate,
    paginationParameters
  } = useResourceQuery({
    endpointId: RemittanceOutwardsRepository.OutwardsOrder.snapshot,
    datasetId: ResourceIds.OutwardsOrder,
    queryFn: fetchGridData,
    filter: {
      endpointId: RemittanceOutwardsRepository.OutwardsOrder.snapshot,
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: RemittanceOutwardsRepository.OutwardsOrder.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const getPlantId = async () => {
    const res = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: `_userId=${userData && userData.userId}&_key=plantId`
    })

    return res?.record?.value
  }

  async function openForm(recordId) {
    const plantId = await getPlantId()

    stack({
      Component: OutwardsForm,
      props: {
        plantId,
        userId: userData?.userId,
        recordId
      }
    })
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'countryRef',
      headerName: _labels.CountryRef,
      flex: 1
    },
    {
      field: 'dispersalName',
      headerName: _labels.DispersalName,
      flex: 1
    },
    ,
    {
      field: 'currencyRef',
      headerName: _labels.Currency,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: _labels.ReleaseStatus,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.Status,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: _labels.WIP,
      flex: 1
    },
    {
      field: 'wfStatusName',
      headerName: _labels.wfStatus,
      flex: 1
    }
  ]

  const delOutwards = async obj => {
    await postRequest({
      extension: RemittanceOutwardsRepository.OutwardsOrder.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.OutwardsOrder,
    action: openForm,
    hasDT: false
  })

  const addOutwards = async () => {
    await proxyAction()
  }

  const editOutwards = obj => {
    openForm(obj.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onAdd={addOutwards}
          maxAccess={access}
          reportName={'RTOWO'}
          labels={_labels}
          inputSearch={true}
          refetch={refetch}
          filterBy={filterBy}
        />
      </Fixed>
      <Grow>
        <Table
          name='owoTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={editOutwards}
          onDelete={delOutwards}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default OutwardsOrder
