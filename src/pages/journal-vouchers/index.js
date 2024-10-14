import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { formatDateDefault } from 'src/lib/date-helper'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemFunction } from 'src/resources/SystemFunction'
import JournalVoucherForm from './forms/JournalVoucherForm'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { responsiveFontSizes } from '@material-ui/core'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const JournalVoucher = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: GeneralLedgerRepository.JournalVoucher.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_params=${params || ''}&_sortField=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: GeneralLedgerRepository.JournalVoucher.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const {
    query: { data },
    labels: _labels,
    filterBy,
    clearFilter,
    paginationParameters,
    invalidate,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: GeneralLedgerRepository.JournalVoucher.page,
    datasetId: ResourceIds.JournalVoucher,
    filter: {
      filterFn: fetchWithFilter
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
      type: 'date'
    },
    {
      field: 'description',
      headerName: _labels.description,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    }
  ]

  const openForm = recordId => {
    stack({
      Component: JournalVoucherForm,
      props: {
        labels: _labels,
        access: access,
        recordId: recordId
      },
      width: 500,
      height: 400,
      title: _labels.generalJournal
    })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.JournalVoucher,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const del = async obj => {
    await postRequest({
      extension: GeneralLedgerRepository.JournalVoucher.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const onApply = ({ search, rpbParams }) => {
    if (!search && rpbParams.length === 0) {
      clearFilter('params')
    } else if (!search) {
      filterBy('params', rpbParams)
    } else {
      filterBy('qry', search)
    }
    refetch()
  }

  const onSearch = value => {
    filterBy('qry', value)
  }

  const onClear = () => {
    clearFilter('qry')
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          onAdd={add}
          maxAccess={access}
          onApply={onApply}
          onSearch={onSearch}
          onClear={onClear}
          reportName={'GLTR'}
        />
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
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default JournalVoucher
