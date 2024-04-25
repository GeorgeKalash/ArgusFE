import { Box } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

const CreditLimitsForm = ({
  setStore,
  labels,
  editMode,
  height,
  store,
  expanded,
  maxAccess
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const {recordId : accountId } = store

  const formik = useFormik({
      enableReinitialize: false,
      validateOnChange: true,
      initialValues: {
        currencies: [
          { id :1,
            accountId: accountId,
            currencyName: '',
            currencyId: '',
            limit: ''
          }
        ]
      },
      onSubmit: values => {
        postCurrencies(values.currencies)
      }
    })

    const postCurrencies = obj => {

      const filteredObj = obj.filter(({ limit }) => limit > 0);

      const saveCurrency = filteredObj.map(currency => {
        const data = {
          accountId: currency.accountId,
          currencyName: currency.currencyName,
          currencyId: currency.currencyId,
          limit: currency.limit
        };
    
        return postRequest({
          extension: FinancialRepository.AccountCreditLimit.set,
          record: JSON.stringify(data)
        })
      });
      Promise.all(saveCurrency)
      .then(res => {
         toast.success('Record Edited Successfully')
      })
      .catch(error => { })
    }

    const column = [
      {
        component: 'textfield',
        label: labels.currency,
        name: 'currencyName',
        props:{readOnly: true}
      },
      {
        component: 'textfield',
        label: labels.CreditLimits,
        name: 'limit',
        props:{type:'number'}
      }
    ]

    useEffect(()=>{
      accountId  && getCurrencies(accountId)
    }, [accountId])

    const getCurrencies = accountId => {
      const defaultParams = `_accountId=${accountId}`
      var parameters = defaultParams
      getRequest({
        extension: FinancialRepository.AccountCreditLimit.qry,
        parameters: parameters
      })
        .then(res => {
          if (res.list.length > 0){
            const currencies = res.list.map(( currency , index) => ({
                id : index,
                ...currency
            }))
            formik.setValues({ currencies: currencies})

          setStore(prevStore => ({
            ...prevStore,
            currencies: currencies,
          }));
          }
        })
        .catch(error => {
        })
    }

  return (
    <FormShell 
      form={formik}
      resourceId={ResourceIds.Accounts}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={editMode}>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', scroll: 'none', overflow:'hidden' }}>
        <DataGrid
          onChange={value => formik.setFieldValue('currencies', value)}
          value={formik.values.currencies}
          error={formik.errors.currencies}
          columns={column}
          allowDelete={false}
          allowAddNewLine={false}
        />
      </Box>
    </FormShell>
  )
}

export default CreditLimitsForm
