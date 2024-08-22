import { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import DocumentTypeMapForm from './forms/DocumentTypeMapForm'

const DocumentTypeMaps = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

  async function fetchGridData() {
    return await getRequest({
      extension: SystemRepository.DocumentTypeMap.qry,
      parameters: `_filter=&_params=`
    })
  }

  const invalidate = useInvalidate({
    endpointId: SystemRepository.DocumentTypeMap.qry
  })

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.DocumentTypeMap.qry,
    datasetId: ResourceIds.DocumentTypeMaps
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
        record: record,
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
        <GridToolbar onAdd={add} maxAccess={access} />
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
