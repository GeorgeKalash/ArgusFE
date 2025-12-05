import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import Form from 'src/components/Shared/Form'

const CreditLimitsForm = ({ setStore, labels, editMode, store, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId: accountId } = store

  const formik = useFormik({
    validateOnChange: true,
    initialValues: {
      currencies: [{ id: 1, accountId: accountId, currencyName: '', currencyId: '', limit: '' }]
    },
    onSubmit: async values => {
      await postCurrencies(values.currencies)
    }
  })

  const postCurrencies = async obj => {
    const filteredObj = obj.filter(({ limit }) => limit >= 0)

    const saveCurrency = filteredObj.map(currency => {
      const data = {
        accountId: currency.accountId,
        currencyName: currency.currencyName,
        currencyId: currency.currencyId,
        limit: currency.limit || 0
      }

      return postRequest({
        extension: FinancialRepository.AccountCreditLimit.set,
        record: JSON.stringify(data)
      })
    })
    Promise.all(saveCurrency)
      .then(res => {
        toast.success('Record Edited Successfully')
      })
      .catch(error => {})
  }

  const column = [
    {
      component: 'textfield',
      label: labels.currency,
      name: 'currencyName',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.CreditLimits,
      name: 'limit',
      props: { maxLength: 12, decimalScale: 2 }
    }
  ]

  useEffect(() => {
    accountId && getCurrencies(accountId)
  }, [accountId])

  const getCurrencies = accountId => {
    const defaultParams = `_accountId=${accountId}`
    var parameters = defaultParams
    getRequest({
      extension: FinancialRepository.AccountCreditLimit.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) {
          const currencies = res.list.map((currency, index) => ({
            id: index,
            ...currency
          }))
          formik.setValues({ currencies: currencies })

          setStore(prevStore => ({
            ...prevStore,
            currencies: currencies
          }))
        }
      })
      .catch(error => {})
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('currencies', value)}
            value={formik.values.currencies}
            error={formik.errors.currencies}
            columns={column}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default CreditLimitsForm
