
import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useInvalidate, useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import DocumentTypeMapForm from './forms/DocumentTypeMapForm'

const DocumentTypeMaps = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: SystemRepository.DocumentTypeMap.page,
      parameters: `_filter=&_params=${params || ''}&_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt }
  }

  const invalidate = useInvalidate({
    endpointId: SystemRepository.DocumentTypeMap.page
  })

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({
      _startAt: pagination?._startAt || 0,
      params: filters?.params
    })
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access,
    filterBy
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.DocumentTypeMap.page,
    datasetId: ResourceIds.DocumentTypeMaps,
    filter: { filterFn: fetchWithFilter }
  })

  const columns = [
    {
      field: 'fromFunctionName',
      headerName: _labels.fromFunction,
      flex: 1
    },
    {
      field: 'fromDTName',
      headerName: _labels.fromDocument,
      flex: 1
    },
    {
      field: 'toFunctionName',
      headerName: _labels.toFunction,
      flex: 1
    },
    {
      field: 'toDTName',
      headerName: _labels.toDocument,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: SystemRepository.DocumentTypeMap.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    openForm()
  }

  function openForm(record) {
    stack({
      Component: DocumentTypeMapForm,
      props: {
        labels: _labels,
        record,
        maxAccess: access,
        recordId: record
          ? String(record.fromFunctionId) + String(record.fromDTId) + String(record.toFunctionId)
          : undefined
      },
      width: 600,
      height: 450,
      title: _labels.documentTypeMap
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar  hasSearch={false} labels={_labels} onAdd={add}  maxAccess={access}  reportName={'SYDTM'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['fromFunctionId', 'fromDTId', 'toFunctionId']}
          onEdit={edit}
          onDelete={del}
          refetch={refetch}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default DocumentTypeMaps
