import { useContext, useState } from 'react'
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
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { FixedAssetsRepository } from 'src/repositories/FixedAssetsRepository'
import AssetsForm from './form/AssetsForm'

const AssetsDescription = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [params, setParams] = useState('')

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: FixedAssetsRepository.AssetsDescription.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_sortField=&_params=${params}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    filterBy,
    refetch,
    clearFilter,
    labels: _labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FixedAssetsRepository.AssetsDescription.snapshot,
    datasetId: ResourceIds.Depreciation,
    filter: {
      filterFn: fetchWithFilter
    }
  })
  async function fetchWithFilter({ filters, pagination = {} }) {
    const { _startAt = 0, _size = 50 } = pagination
    if (filters.qry) {
      const response = await getRequest({
        extension: FixedAssetsRepository.AssetsDescription.snapshot,
        parameters: `_filter=${filters.qry}&_startAt=${_startAt}&_size=${_size}`
      })

      return { ...response, _startAt: _startAt }
    } else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const columns = [
    {
      field: 'dtName',
      headerName: _labels.dtName,
      flex: 1
    },
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
      field: 'plantName',
      headerName: _labels.plantName,
      flex: 1
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
      field: 'notes',
      headerName: _labels.notes,
      flex: 1
    }
  ]

  function openForm(recordId) {
    stack({
      Component: AssetsForm,
      props: {
        labels: _labels,
        recordId,
        maxAccess: access
      },
      width: 1200,
      height: 660,
      title: _labels.assetD
    })
  }

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: FixedAssetsRepository.AssetsDescription.del,
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
    if (rpbParams) {
      setParams(rpbParams)
    }
    refetch()
  }

  const onSearch = value => {
    filterBy('qry', value)
  }

  const onClear = () => {
    onApply({ search: '', rpbParams: params })
    clearFilter('qry')
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onAdd={add}
          maxAccess={access}
          onApply={onApply}
          onSearch={onSearch}
          onClear={onClear}
          reportName={'FADEP'}
        />
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
          deleteConfirmationType={'strict'}
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default AssetsDescription
