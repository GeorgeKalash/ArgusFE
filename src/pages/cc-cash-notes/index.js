import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CashCountRepository } from 'src/repositories/CashCountRepository'
import CcCashNotesForm from './forms/CcCashNotesForm'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const CcCashNotes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: CashCountRepository.CcCashNotes.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=&_currencyId=0`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    invalidate,
    query: { data },
    labels: labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CashCountRepository.CcCashNotes.page,
    datasetId: ResourceIds.CashNote
  })

  const columns = [
    {
      field: 'currencyRef',
      headerName: labels.currencyRef,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: labels.currencyName,
      flex: 1
    },

    {
      field: 'note',
      headerName: labels.currencyNote,
      flex: 1,
      type: 'number'
    }
  ]

  const add = () => {
    openForm()
  }

  const popup = obj => {
    openForm(obj)
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: CashCountRepository.CcCashNotes.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
  }

  function openForm(record) {
    stack({
      Component: CcCashNotesForm,
      props: {
        labels: labels,
        record: record,
        recordId: record
          ? String(record.currencyId * 10) + record.note
          : null,
        maxAccess: access
      },
      width: 600,
      height: 300,
      title: labels.CcCashNotes
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} labels={labels} />
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
