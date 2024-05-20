import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CachCountSettingsRepository } from 'src/repositories/CachCountSettingsRepository'
import CcCashNotesForm from './forms/CcCashNotesForm'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { getFormattedNumber } from 'src/lib/numberField-helper'

const CcCashNotes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: CachCountSettingsRepository.CcCashNotes.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=&_currencyId=0`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    invalidate,
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CachCountSettingsRepository.CcCashNotes.page,
    datasetId: ResourceIds.CashNote
  })

  const columns = [
    {
      field: 'currencyRef',
      headerName: _labels.currencyRef,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: _labels.currencyName,
      flex: 1
    },

    {
      field: 'note',
      headerName: _labels.note,
      flex: 1,
      valueGetter: ({ row }) => getFormattedNumber(row?.note)
    }
  ]

  const add = () => {
    openForm()
  }

  const popup = obj => {
    openForm(obj?.currencyId, obj?.note)
  }

  const del = async obj => {
    await postRequest({
      extension: CachCountSettingsRepository.CcCashNotes.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  function openForm(currencyId, note) {
    stack({
      Component: CcCashNotesForm,
      props: {
        labels: _labels,
        note: note ? note : null,
        currencyId: currencyId ? currencyId : null,
        maxAccess: access
      },
      width: 600,
      height: 300,
      title: _labels.CcCashNotes
    })
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
          rowId={['currencyId', 'note']}
          onEdit={popup}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default CcCashNotes
