import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'

const CreditLimitsForm = ({ labels, editMode, store, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId: accountId } = store

  const { formik } = useForm({
    validateOnChange: true,
    maxAccess,
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
    Promise.all(saveCurrency).then(res => {
      toast.success(platformLabels.Edited)
    })
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
  }, [])

  const getCurrencies = accountId => {
    getRequest({
      extension: FinancialRepository.AccountCreditLimit.qry,
      parameters: `_accountId=${accountId}`
    }).then(res => {
      if (res.list.length > 0) {
        const currencies = res.list.map((currency, index) => ({
          id: index,
          ...currency
        }))
        formik.setValues({ currencies })
      }
    })
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
