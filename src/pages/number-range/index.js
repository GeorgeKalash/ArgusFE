import { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import NumberRangeForm from './forms/NumberRangeForm'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'

const NumberRange = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: SystemRepository.NumberRange.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access,
    search,
    clear
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.NumberRange.qry,
    datasetId: ResourceIds.NumberRange,
    search: {
      endpointId: SystemRepository.NumberRange.snapshot,
      searchFn: fetchWithSearch
    }
  })
  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: SystemRepository.NumberRange.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  const invalidate = useInvalidate({
    endpointId: SystemRepository.NumberRange.qry
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1,
      editable: false
    },
    {
      field: 'description',
      headerName: _labels.description,
      flex: 1,
      editable: false
    },
    {
      field: 'min',
      headerName: _labels.min,
      flex: 1,
      editable: false
    },
    {
      field: 'max',
      headerName: _labels.max,
      flex: 1,
      editable: false
    },
    {
      field: 'current',
      headerName: _labels.current,
      flex: 1,
      editable: false
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
      Component: NumberRangeForm,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 700,
      height: 620,
      title: _labels.numberRange
    })
  }

  const del = async obj => {
    await postRequest({
      extension: SystemRepository.NumberRange.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          labels={_labels}
          inputSearch={true}
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
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default NumberRange
