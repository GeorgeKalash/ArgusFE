import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function OpeningBalanceForm({ labels, maxAccess, recordId, record }) {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.OpeningBalance.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      fiscalYear: '',
      accountId: '',
      currencyId: '',
      currencyRef: '',
      amount: '',
      baseAmount: '',
      ...record
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      fiscalYear: yup.string().required(' '),
      accountId: yup.string().required(' '),
      currencyId: yup.string().required(' '),
      amount: yup.number().required(' '),
      baseAmount: yup.number().required(' ')
    }),
    onSubmit: async obj => {
      const currencyId = formik.values.currencyId
      const fiscalYear = formik.values.fiscalYear
      const accountId = formik.values.accountId

      await postRequest({
        extension: CashBankRepository.OpeningBalance.set,
        record: JSON.stringify(obj)
      })

      if (!currencyId && !fiscalYear && !accountId) {
        toast.success('Record Added Successfully')
      } else toast.success('Record Edited Successfully')
      formik.setValues({
        ...obj,

        recordId: String(obj.fiscalYear * 1000) + String(obj.accountId * 100) + String(obj.currencyId * 10)
      })

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId || !!recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (record && record.currencyId && record.fiscalYear && record.accountId) {
          const res = await getRequest({
            extension: CashBankRepository.OpeningBalance.get,
            parameters: `_fiscalYear=${formik.values.fiscalYear}&_accountId=${formik.values.accountId}&_currencyId=${formik.values.currencyId}`
          })

          formik.setValues({
            ...res.record,
            accountId: formik.values.accountId,

            recordId:
              String(res.record.fiscalYear * 1000) +
              String(res.record.accountId * 100) +
              String(res.record.currencyId * 10)
          })
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.OpeningBalance} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                readOnly={editMode}
                name='fiscalYear'
                label={labels.fiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('fiscalYear', newValue?.fiscalYear)
                }}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 0
                }}
                required
                readOnly={editMode}
                name='accountId'
                label={labels.accountRef}
                valueField='reference'
                displayField='name'
                valueShow='cashAccountRef'
                secondValueShow='cashAccountName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue?.recordId || '')
                  formik.setFieldValue('cashAccountRef', newValue?.reference || '')
                  formik.setFieldValue('cashAccountName', newValue?.name || '')
                }}
                error={formik.touched.accountId && Boolean(formik.errors.accountId)}
                maxAccess={maxAccess}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={editMode}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || '')
                  formik.setFieldValue('currencyRef', newValue?.reference || '')
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='amount'
                required
                label={labels.amount}
                value={formik.values.amount}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('amount', e.target.value)}
                onClear={() => formik.setFieldValue('amount', '')}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                maxLength={10}
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='baseAmount'
                required
                label={labels.baseAmount}
                value={formik.values.baseAmount}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('baseAmount', e.target.value)}
                onClear={() => formik.setFieldValue('baseAmount', '')}
                error={formik.touched.baseAmount && Boolean(formik.errors.baseAmount)}
                maxLength={10}
                decimalScale={2}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
