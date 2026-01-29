import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function OpeningBalanceForm({ labels, maxAccess, recordId, record }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.OpeningBalance.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      fiscalYear: '',
      cashAccountId: '',
      currencyId: '',
      currencyRef: '',
      amount: '',
      baseAmount: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      fiscalYear: yup.string().required(),
      cashAccountId: yup.string().required(),
      currencyId: yup.string().required(),
      amount: yup.number().required(),
      baseAmount: yup.number().required()
    }),
    onSubmit: async obj => {
      const currencyId = formik.values.currencyId
      const fiscalYear = formik.values.fiscalYear
      const cashAccountId = formik.values.cashAccountId

      await postRequest({
        extension: CashBankRepository.OpeningBalance.set,
        record: JSON.stringify(obj)
      })
      toast.success(!currencyId && !fiscalYear && !cashAccountId ? platformLabels.Added : platformLabels.Edited)
      formik.setValues({
        ...obj,
        recordId: String(obj.fiscalYear * 1000) + String(obj.cashAccountId * 100) + String(obj.currencyId * 10)
      })

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (record && record.currencyId && record.fiscalYear && record.cashAccountId && recordId) {
        const res = await getRequest({
          extension: CashBankRepository.OpeningBalance.get,
          parameters: `_fiscalYear=${record.fiscalYear}&_cashAccountId=${record.cashAccountId}&_currencyId=${record.currencyId}`
        })

        formik.setValues({
          ...res.record,
          recordId:
            String(res.record.fiscalYear * 1000) +
            String(res.record.cashAccountId * 100) +
            String(res.record.currencyId * 10)
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.OpeningBalance} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
              <ResourceComboBox
                endpointId={CashBankRepository.CashAccount.qry}
                parameters={`_type=0`}
                name='cashAccountId'
                readOnly={editMode}
                required
                label={labels.accountRef}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('cashAccountId', newValue?.recordId || null)
                }}
                error={formik.touched.cashAccountId && Boolean(formik.errors.cashAccountId)}
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
