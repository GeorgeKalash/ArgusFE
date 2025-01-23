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
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { SystemFunction } from 'src/resources/SystemFunction'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'
import MaterialRequestForm from './Forms/MaterialRequestForm'

const IvMaterialsTransfer = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: IVReplenishementRepository.MaterialReplenishment.page,
      parameters: `_filter=&_size=30&_startAt=${_startAt}&_sortBy=recordId desc&_pageSize=${_pageSize}&_params=${
        params || ''
      }`
    })

    response.list = response?.list?.map(item => ({
      ...item,
      isVerified: !!item?.isVerified
    }))

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: IVReplenishementRepository.MaterialReplenishment.snapshot,
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
    endpointId: IVReplenishementRepository.MaterialReplenishment.page,
    datasetId: ResourceIds.MaterialReplenishment,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.MaterialRequest,
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
      field: 'departmentName',
      headerName: _labels.department,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: _labels.site,
      flex: 1
    },
    {
      field: 'fromSiteName',
      headerName: _labels.fromSite,
      flex: 1
    },
    {
      field: 'notes',
      headerName: _labels.notes,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: _labels.releaseStatus,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: _labels.wip,
      flex: 1
    },
  ]

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: MaterialRequestForm,
      props: {
        labels: _labels,
        recordId,
        maxAccess: access
      },
      width: 1000,
      height: 680,
      title: _labels.MaterialRequest
    })
  }

  const del = async obj => {
    await postRequest({
      extension: IVReplenishementRepository.MaterialReplenishment.del,
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
          reportName={'IRREQ'}
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
