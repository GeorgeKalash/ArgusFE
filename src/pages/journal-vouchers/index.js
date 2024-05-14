// ** React Imports
import { useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { formatDateDefault } from 'src/lib/date-helper'

// ** Windows
import JournalVoucherWindow from './Windows/JournalVoucherWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemFunction } from 'src/resources/SystemFunction'
import documentType from 'src/lib/docRefBehaivors'
import { useWindow } from 'src/windows'
import JournalVoucherForm from './forms/JournalVoucherForm'
import { useError } from 'src/error'

const JournalVoucher = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()

  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [errorMessage, setErrorMessage] = useState(null)

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

  const add = async () => {
    const general = await documentType(getRequest, SystemFunction.JournalVoucher, access)
    !general?.errorMessage
      ? stack({
          Component: JournalVoucherForm,
          props: {
            labels: _labels,
            access: access,
            recordId: selectedRecordId,
            setSelectedRecordId: setSelectedRecordId,
            general
          },
          width: 500,
          height: 500,
          title: _labels.generalJournal
        })
      : stackError({ message: general?.errorMessage })
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

  return (
    <>
      <Box>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          labels={_labels}
          inputSearch={true}
        />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          maxAccess={access}
        />
      </Box>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default JournalVoucher
