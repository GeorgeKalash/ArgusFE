import { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ReleaseIndicatorForm from './forms/ReleaseIndicatorForm'
import { useWindow } from 'src/windows'

const ReleaseIndicators = () => {
  const { stack } = useWindow()

  const { getRequest, postRequest } = useContext(RequestsContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: DocumentReleaseRepository.ReleaseIndicator.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: DocumentReleaseRepository.ReleaseIndicator.page,
    datasetId: ResourceIds.ReleaseIndicators
  })

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.ReleaseIndicator.page
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'recordId',
      headerName: _labels.id,
      flex: 1,
      align: 'right'
    },
    {
      field: 'changeabilityName',
      headerName: _labels.changeability,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: ReleaseIndicatorForm,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 600,
      height: 420,
      title: _labels.releaseIndicator
    })
  }

  const del = async obj => {
    await postRequest({
      extension: DocumentReleaseRepository.ReleaseIndicator.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />{' '}
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

export default ReleaseIndicators
