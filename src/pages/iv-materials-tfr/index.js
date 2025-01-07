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

const IvMaterialsTransfer = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()

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
    clearFilter,
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

  async function getPlantId() {
    const myObject = {}

    const filteredList = userDefaultsData?.list?.filter(obj => {
      return obj.key === 'plantId'
    })
    filteredList.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))

    return myObject.plantId
  }

  function openOutWardsWindow(plantId, recordId) {
    stack({
      Component: MaterialsTransferForm,
      props: {
        labels: _labels,
        recordId,
        plantId,
        maxAccess: access
      },
      width: 1000,
      height: 680,
      title: _labels.MaterialsTransfer
    })
  }

  async function openForm(recordId) {
    const plantId = await getPlantId()

    plantId !== ''
      ? openOutWardsWindow(plantId, recordId)
      : stackError({
          message: platformLabels.noDefaultPlant
        })
  }

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.MaterialsTransfer.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const onApply = ({ search, rpbParams }) => {
    if (!search && rpbParams.length === 0) {
      clearFilter('params')
    } else if (!search) {
      filterBy('params', rpbParams)
    } else {
      filterBy('qry', search)
    }
    refetch()
  }

  const onSearch = value => {
    filterBy('qry', value)
  }

  const onClear = () => {
    clearFilter('qry')
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onSearch={onSearch}
          onClear={onClear}
          labels={_labels}
          onAdd={add}
          maxAccess={access}
          onApply={onApply}
          reportName={'IVTFR'}
        />
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
