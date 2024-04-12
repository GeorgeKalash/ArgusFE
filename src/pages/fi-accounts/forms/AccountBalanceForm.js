import { Box } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'

// ** Custom Imports
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

const AccountBalanceForm = ({
  setStore,
  labels,
  height,
  store,
  expanded,
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const {recordId : accountId } = store

  const formik = useFormik({
      enableReinitialize: false,
      validateOnChange: true,
      initialValues: {
        balances: [
          { id :1,
            accountId: accountId,
            currencyName: '',
            currencyId: '',
            balance: ''
          }
        ]
      },
     
    })

    const column = [
      {
        component: 'textfield',
        label: labels.currency,
        name: 'currencyName',
        props:{readOnly: true}
      },
      {
        component: 'textfield',
        label: labels.balance,
        name: 'balance',
        props:{readOnly: true}
      }
    ]

    useEffect(()=>{
      accountId  && getCurrencies(accountId)
    }, [accountId])

    const getCurrencies = accountId => {
      const defaultParams = `_accountId=${accountId}`
      var parameters = defaultParams
      getRequest({
        extension: FinancialRepository.AccountCreditBalance.qry,
        parameters: parameters
      })
        .then(res => {
          if (res.list.length > 0){
            const balances = res.list.map(({ ...rest } , index) => ({
                id : index,
                ...rest
            }))
            formik.setValues({ balances: balances})

          setStore(prevStore => ({
            ...prevStore,
            balances: balances,
          }));
          }
        })
        .catch(error => {
        })
    }

  return (
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', scroll: 'none', overflow:'hidden' }}>
        <DataGrid
           onChange={value => formik.setFieldValue('balances', value)}
           value={formik.values.balances}
           error={formik.errors.balances}
           columns={column}
           height={`${expanded ? `calc(100vh - 280px)` : `${height-100}px`}`}

        />
      </Box>
  )
}

export default AccountBalanceForm

