// ** React Imports
import { useContext } from 'react'

import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

// ** Helpers
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CashCountForm from './forms/CashCountForm'
import { CashCountRepository } from 'src/repositories/CashCountRepository'
import { formatDateDefault, getTimeInTimeZone } from 'src/lib/date-helper'

const CashCount = () => {
  const { stack } = useWindow()
  const { getRequest, postRequest } = useContext(RequestsContext)

  async function fetchWithSearch({ options = {}, filters }) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: CashCountRepository.CashCountTransaction.snapshot,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=${filters.qry}`
    })
  }

  async function fetchGridData() {
    return await getRequest({
      extension: CashCountRepository.CashCountTransaction.qry,
      parameters: ``
    })
  }

  const {
    query: { data },
    filterBy,
    clearFilter,
    labels: _labels,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CashCountRepository.CashCountTransaction.qry,
    datasetId: ResourceIds.CashCountTransaction,
    filter: {
      endpointId: CashCountRepository.CashCountTransaction.snapshot,
      filterFn: fetchWithSearch
    }
  })

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
      valueGetter: ({ row }) => formatDateDefault(row?.date)
    },
    {
      field: 'plantName',
      headerName: _labels.plant,
      flex: 1
    },
    {
      field: 'cashAccountName',
      headerName: _labels.cashAccount,
      flex: 1
    },
    {
      field: 'startTime',
      headerName: _labels.startTime,
      flex: 1,
      valueGetter: ({ row }) => getTimeInTimeZone(row.startTime)
    },
    {
      field: 'endTime',
      headerName: _labels.endTime,
      flex: 1,
      valueGetter: ({ row }) => row.endTime && getTimeInTimeZone(row.endTime)
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
    }
  ]

  const add = () => {
    openForm()
  }
  function openForm(recordId) {
    stack({
      Component: CashCountForm,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 1100,
      height: 700,
      title: _labels.cashCount
    })
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: CashCountRepository.CashCountTransaction.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          labels={_labels}
          inputSearch={true}
        />{' '}
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
          isLoading={false}
          refetch={refetch}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default CashCount
