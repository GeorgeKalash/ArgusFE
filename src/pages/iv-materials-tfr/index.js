import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { useError } from 'src/error'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import MaterialsTransferForm from './Form/MaterialsTransferForm'
import { SystemFunction } from 'src/resources/SystemFunction'
import { DefaultsContext } from 'src/providers/DefaultsContext'

const IvMaterialsTransfer = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { userDefaults } = useContext(DefaultsContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const plantId = parseInt(userDefaults?.list?.find(obj => obj.key === 'plantId')?.value)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: InventoryRepository.MaterialsTransfer.page,
      parameters: `_filter=&_size=30&_startAt=${_startAt}&_sortBy=recordId desc&_pageSize=${_pageSize}&_params=${
        params || ''
      }`
    })

    response.list = response?.list?.map(item => ({
      ...item,
      isVerified: item?.isVerified === null ? false : item?.isVerified
    }))

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: InventoryRepository.MaterialsTransfer.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const {
    query: { data },
    labels: _labels,
    filterBy,
    paginationParameters,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.MaterialsTransfer.page,
    datasetId: ResourceIds.MaterialsTransfer,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.MaterialTransfer,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
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
      field: 'fromSiteRef',
      headerName: _labels.fromSiteRef,
      flex: 1
    },
    {
      field: 'fromSiteName',
      headerName: _labels.fromSite,
      flex: 1
    },
    {
      field: 'toSiteRef',
      headerName: _labels.toSiteRef,
      flex: 1
    },
    {
      field: 'toSiteName',
      headerName: _labels.toSite,
      flex: 1
    },
    {
      field: 'closedDate',
      headerName: _labels.shippingDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'receivedDate',
      headerName: _labels.receivedDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'pcs',
      headerName: _labels.pcs,
      flex: 1,
      type: 'number'
    },
    {
      field: 'qty',
      headerName: _labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: _labels.wip,
      flex: 1
    },
    {
      field: 'printStatusName',
      headerName: _labels.print,
      flex: 1
    },
    {
      field: 'notes',
      headerName: _labels.notes,
      flex: 1
    },

    {
      field: 'isVerified',
      headerName: _labels.isVerified,
      type: 'checkbox',
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openOutWardsWindow(recordId) {
    stack({
      Component: MaterialsTransferForm,
      props: {
        recordId
      }
    })
  }

  async function openForm(recordId) {
    !plantId && !recordId
      ? stackError({
          message: platformLabels.noDefaultPlant
        })
      : openOutWardsWindow(recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.MaterialsTransfer.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar labels={_labels} onAdd={add} maxAccess={access} reportName={'IVTFR'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
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

export default IvMaterialsTransfer
