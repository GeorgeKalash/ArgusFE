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

// ** Helpers
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import ChartOfAccountsForm from './forms/ChartOfAccountsForm'
import { useWindow } from 'src/windows'

const ChartOfAccounts = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: GeneralLedgerRepository.ChartOfAccounts.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_params=`
    })
  }

  const {
    query: { data },
    search,
    clear,
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: GeneralLedgerRepository.ChartOfAccounts.page,
    datasetId: ResourceIds.ChartOfAccounts,
    search: {
      endpointId: GeneralLedgerRepository.ChartOfAccounts.snapshot,
      searchFn: fetchWithSearch
    }
  })

  const invalidate = useInvalidate({
    endpointId: GeneralLedgerRepository.ChartOfAccounts.page
  })

  async function fetchWithSearch({ options = {}, qry }) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: GeneralLedgerRepository.ChartOfAccounts.snapshot,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=${qry}`
    })
  }

  const columns = [
    {
      field: 'accountRef',
      headerName: _labels.accountRef,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'description',
      headerName: _labels.description,
      flex: 1
    },
    {
      field: 'activeStatusName',
      headerName: _labels.status,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: GeneralLedgerRepository.ChartOfAccounts.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  const add = () => {
    openForm('')
  }

  function openForm(recordId) {
    stack({
      Component: ChartOfAccountsForm,
      props: {
        labels: _labels,
        maxAccess: access,
        recordId: recordId ? recordId : null
      },
      width: 500,
      height: 540,
      title: _labels.chartOfAccount
    })
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
          gridData={data ?? { list: [] }}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          refetch={refetch}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Box>
    </>
  )
}

export default ChartOfAccounts
