// ** React Importsport
import { useContext, useEffect, useState } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

// ** Helpers
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { useWindow } from 'src/windows'

const AccountBalanceForm = (
 { 
  labels,
  height,
  maxAccess,
  store,
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [CharacteristicGridData , setCharacteristicGridData] = useState()
  const { stack } = useWindow()
  const { recordId } = store

  const columns = [
    {
      field: 'currencyName',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'balance',
      headerName: labels.balance,
      flex: 1
    }
  ]

  const getCharacteristicGridData = accountId => {
    setCharacteristicGridData([])
    const defaultParams = `_accountId=${accountId}`
    var parameters = defaultParams
    getRequest({
      extension: FinancialRepository.AccountCreditBalance.qry,
      parameters: parameters
    })
      .then(res => {
        setCharacteristicGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(()=>{
    recordId && getCharacteristicGridData(recordId)
  },[recordId])

  return (
    <>
      <Box>
        <GridToolbar maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={CharacteristicGridData}
          rowId={['currencyId']}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={height-50}
        />
      </Box>
    </>
  )
}

export default AccountBalanceForm
