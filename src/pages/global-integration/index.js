import { Box } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'

const GlobalIntegration = ({
  editMode,
  height,
  expanded
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels: _labels,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: GeneralLedgerRepository.GlobalIntegration.qry,
    datasetId: ResourceIds.IntegrationAccount,
  })

  async function fetchGridData(options={}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams

     const response =  await getRequest({
      extension: GeneralLedgerRepository.GlobalIntegration.page,
      parameters: parameters
    })

    return {...response,  _startAt: _startAt}
  }

  const formik = useFormik({
      enableReinitialize: false,
      validateOnChange: true,
      initialValues: {
        postTypeId:null,
        accountId: null,
        accountRef: null,
        accountName: ''
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
          extension: GeneralLedgerRepository.AccountCreditLimit.set,
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
        label: _labels.currency,
        name: 'currencyName',
        props:{readOnly: true}
      },
      {
        component: 'textfield',
        label: _labels.CreditLimits,
        name: 'limit',
        props:{type:'number'}
      }
    ]

    const getCurrencies = accountId => {
      const defaultParams = `_accountId=${accountId}`
      var parameters = defaultParams
      getRequest({
        extension: GeneralLedgerRepository.AccountCreditLimit.qry,
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
      maxAccess={access}
      infoVisible={false}
      editMode={editMode}>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', scroll: 'none', overflow:'hidden' }}>
        <DataGrid   
           onChange={value => formik.setFieldValue('currencies', value)}
           value={formik.values}
           error={formik.errors}
           columns={column}
           allowDelete={false}
           allowAddNewLine={false}
           height={`${expanded ? `calc(100vh - 280px)` : `${height-100}px`}`}

        />
      </Box>
    </FormShell>
  )
}

export default GlobalIntegration
