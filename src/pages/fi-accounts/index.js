// ** React Importsport
import { useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import AccountsWindow from './Windows/AccountsWindow'

// ** Helpers
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

const MfAccounts = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  //control

  const {
    query: { data },
    labels: _labels,
    search,
    clear,
    paginationParameters,
    invalidate,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.Account.page,
    datasetId: ResourceIds.Accounts,
    search: {
      endpointId: FinancialRepository.Account.snapshot,
      searchFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: FinancialRepository.Account.snapshot,
      parameters: `_filter=${qry}`
    })
  }

  async function fetchGridData(options={}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams

     const response =  await getRequest({
      extension: FinancialRepository.Account.page,
      parameters: parameters
    })

    return {...response,  _startAt: _startAt}
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'groupName',
      headerName: _labels.accountGroup,
      flex: 1
    },
    {
      field: 'typeName',
      headerName: _labels.type,
      flex: 1
    },
  ]

  const delAccounts = obj => {
    postRequest({
      extension: FinancialRepository.Account.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        invalidate()
      })
  }

  const addAccounts = () => {
    openForm('')
  }

  function openForm (recordId){
    stack({
      Component: AccountsWindow,
      props: {
        labels: _labels,
        recordId: recordId? recordId : null,
        maxAccess: access,
      },
      width: 600,
      height: 600,
      title: _labels.Accounts
    })
  }

  const popup = obj => {
    openForm(obj?.recordId )
  }

  return (
    <>
      <Box>
        <GridToolbar 
          onAdd={addAccounts} 
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
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={popup}
          onDelete={delAccounts}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
    </>
  )
}

export default MfAccounts
