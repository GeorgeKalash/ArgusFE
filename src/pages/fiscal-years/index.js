import React, { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { formatDateDefault } from 'src/lib/date-helper'
import FiscalYearWindow from './Windows/FiscalYearWindow'
import date from 'src/components/Shared/DataGrid/components/date'

const FiscalYear = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _filter = '' } = options

    return await getRequest({
      extension: SystemRepository.FiscalYears.qry,
      parameters: `_filter=${_filter}`
    })
  }

  const {
    query: { data },
    refetch,
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.FiscalYears.qry,
    datasetId: ResourceIds.FiscalYears
  })

  const invalidate = useInvalidate({
    endpointId: SystemRepository.FiscalYears.qry
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
      type: date
    },
    ,
    {
      field: 'endDate',
      headerName: _labels.endDate,
      flex: 1,
      type: date
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
      width: 800,
      title: _labels.fiscalYear
    })
  }

  const edit = obj => {
    console.log('obj', obj)
    openForm(obj.fiscalYear)
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
          rowId={['fiscalYear']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
          refetch={refetch}
          globalStatus={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default FiscalYear
