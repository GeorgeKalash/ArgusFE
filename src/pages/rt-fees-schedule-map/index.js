import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'

import { ControlContext } from 'src/providers/ControlContext'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import FeeScheduleMapForm from './forms/FeeScheduleMapForm'

const FeeScheduleMap = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: RemittanceOutwardsRepository.FeeScheduleMap.qry,

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
    endpointId: RemittanceOutwardsRepository.FeeScheduleMap.qry,
    datasetId: ResourceIds.FeeScheduleMap
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.FeeScheduleMap.qry
  })

  const columns = [
    {
      field: 'corRef',
      headerName: _labels.corRef,
      flex: 1
    },
    {
      field: 'corName',
      headerName: _labels.corName,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'countryName',
      headerName: _labels.country,
      flex: 1
    },
    {
      field: 'functionName',
      headerName: _labels.function,
      flex: 1
    },
    {
      field: 'dispersalModeName',
      headerName: _labels.dispersalMode,
      flex: 1
    },
    {
      field: 'scheduleName',
      headerName: _labels.schedule,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  const del = async obj => {
    await postRequest({
      extension: RemittanceOutwardsRepository.FeeScheduleMap.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(record) {
    stack({
      Component: FeeScheduleMapForm,
      props: {
        labels: _labels,
        record,
        maxAccess: access,
        recordId: record
          ? String(record.currencyId * 1000) +
            String(record.corId * 10000) +
            String(record.dispersalMode * 10) +
            String(record.functionId) +
            String(record.countryId * 100)
          : null
      },
      width: 700,
      height: 560,
      title: _labels.fsm
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
          rowId={['corId , functionId , currencyId ,countryId,dispersalMode']}
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

export default FeeScheduleMap
