import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { formatDateDefault } from 'src/lib/date-helper'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemFunction } from 'src/resources/SystemFunction'
import JournalVoucherForm from './forms/JournalVoucherForm'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import useDocumentType from 'src/hooks/dcocumentReferenceBehaviors'

const JournalVoucher = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [selectedRecordId, setSelectedRecordId] = useState()

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: GeneralLedgerRepository.JournalVoucher.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_params=&_sortField=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    search,
    clear,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: GeneralLedgerRepository.JournalVoucher.qry,
    datasetId: ResourceIds.JournalVoucher,
    search: {
      endpointId: GeneralLedgerRepository.JournalVoucher.snapshot,
      searchFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: GeneralLedgerRepository.JournalVoucher.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  const invalidate = useInvalidate({
    endpointId: GeneralLedgerRepository.JournalVoucher.qry
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

  const action = {
    Component: JournalVoucherForm,
    props: {
      labels: _labels,
      access: access,
      recordId: selectedRecordId,
      setSelectedRecordId: setSelectedRecordId
    },
    width: 500,
    height: 500,
    title: _labels.generalJournal
  }

  const { sectionAction } = useDocumentType({ functionId: SystemFunction.JournalVoucher, action })

  const add = async () => {
    await sectionAction()
  }

  const edit = obj => {
    stack({
      Component: JournalVoucherForm,
      props: {
        labels: _labels,
        access: access,
        recordId: obj.recordId
      },
      width: 500,
      height: 500,
      title: _labels.generalJournal
    })
  }

  const del = async obj => {
    await postRequest({
      extension: GeneralLedgerRepository.JournalVoucher.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  function openForm(recordId) {
    stack({
      Component: JournalVoucherForm,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access,
        invalidate: invalidate
      },
      width: 600,
      height: 600,
      title: _labels.generalJournal
    })
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
