import React, { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import BPMasterDataWindow from './Windows/BPMasterDataWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const FiscalYear = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: SystemRepository.FiscalYears.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}` //&_params=&_sortBy=reference desc`
    })
  }

  const {
    query: { data },
    refetch,
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.FiscalYears.page,
    datasetId: ResourceIds.FiscalYears
  })

  const invalidate = useInvalidate({
    endpointId: SystemRepository.FiscalYears.page
  })

  const columns = [
    {
      field: 'fiscalYear',
      headerName: _labels.fiscalYear,
      flex: 1
    },
    {
      field: 'startDate',
      headerName: _labels.startDate,
      flex: 1,
      valueGetter: ({ row }) => formatDateDefault(row?.startDate)
    },
    ,
    {
      field: 'endDate',
      headerName: _labels.endDate,
      flex: 1,
      valueGetter: ({ row }) => formatDateDefault(row?.endDate)
    }
  ]

  const add = () => {
    openForm('')
  }

  function openForm(recordId) {
    stack({
      Component: FiscalYearWindow,
      props: {
        labels: _labels,
        maxAccess: access,
        recordId: recordId ? recordId : null
      },
      width: 1200,
      title: _labels.fiscalYear
    })
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: SystemRepository.FiscalYears.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} labels={_labels} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          //deleteConfirmationType={'strict'}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default FiscalYear
