import React, { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import FiscalYearWindow from './Windows/FiscalYearWindow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'

const FiscalYear = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: SystemRepository.FiscalYears.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    refetch,
    labels: _labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.FiscalYears.page,
    datasetId: ResourceIds.FiscalYears
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
      type: 'date'
    },
    ,
    {
      field: 'endDate',
      headerName: _labels.endDate,
      flex: 1,
      type: 'date'
    }
  ]

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: FiscalYearWindow,
      props: {
        labels: _labels,
        maxAccess: access,
        recordId: recordId
      },
      width: 800,
      title: _labels.fiscalYear
    })
  }

  const edit = obj => {
    openForm(obj.fiscalYear)
  }

  const del = async obj => {
    await postRequest({
      extension: SystemRepository.FiscalYears.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
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
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
          refetch={refetch}
          globalStatus={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default FiscalYear
