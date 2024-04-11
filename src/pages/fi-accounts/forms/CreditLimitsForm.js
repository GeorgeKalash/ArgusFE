import { Box } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'

// ** Custom Imports
import * as yup from 'yup'
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

      validationSchema: yup.object({ currencies: yup
        .array()
        .of(
          yup.object().shape({
            currencyId: yup.string().required('currency recordId is required')
          })
        ).required('Operations array is required') }),
      initialValues: {
        currencies: [
          { id :1,
            accountId: accountId,
            currencyId: '',
            currencyName: '',
            limit: ''
          }
        ]
      },
      onSubmit: values => {
        postCreditLimits(values.currencies)
      }
    })

    const postCreditLimits = obj => {

      const data = {
        accountId: accountId,
        CreditLimits : obj.map(
          ({accountId,...rest} ) => ({
              accountId: accountId,
              ...rest
          }))}
      postRequest({
        extension: FinancialRepository.AccountCreditLimit.set,
        record: JSON.stringify(data)
      })
        .then(res => {
          if (res) toast.success('Record Edited Successfully')
          getCurrencies(accountId)
        })
        .catch(error => {
        })
    }

    const column = [
      {
        component: 'textfield',
        label: labels.name,
        name: 'currencyName',
        mandatory: false,
        readOnly: true
      },
      {
        component: 'textfield',
        label: labels.limit,
        name: 'limit',
        mandatory: false
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
            const list = res.list.map(({ currencyId, currencyName, limit, ...rest } , index) => ({
               id : index,
              currencyId,
              currencyName,
              limit,
               ...rest
            }))
            formik.setValues({ currencies: list})

          setStore(prevStore => ({
            ...prevStore,
            list: list,
          }));
          console.log(list)

          }

        })
        .catch(error => {
        })
    }

  return (
    <FormShell form={formik}
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
           height={`${expanded ? `calc(100vh - 280px)` : `${height-100}px`}`}

        />
      </Box>
    </FormShell>
  )
}

export default CreditLimitsForm
