import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { DataSets } from 'src/resources/DataSets'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'

export default function OpeningBalancesForm({ labels, maxAccess, record, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: GeneralLedgerRepository.OpeningBalances.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      fiscalYear: null,
      accountId: null,
      currencyId: null,
      sign: '',
      costCenterId: null,
      amount: null,
      baseAmount: null
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      fiscalYear: yup.number().required(),
      accountId: yup.number().required(),
      currencyId: yup.number().required(),
      sign: yup.string().required(),
      amount: yup.number().required(),
      baseAmount: yup.number().required()
    }),
    onSubmit: async obj => {
      const currencyId = formik.values.currencyId
      const fiscalYear = formik.values.fiscalYear
      const accountId = formik.values.accountId
      const costCenterId = formik.values.costCenterId

      const response = await postRequest({
        extension: GeneralLedgerRepository.OpeningBalances.set,
        record: JSON.stringify(obj)
      })

      if (!currencyId && !fiscalYear && !accountId && !costCenterId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
      } else toast.success(platformLabels.Edited)
      formik.setValues({
        ...obj,
        recordId: String(obj.fiscalYear * 10) + String(obj.accountId) + String(obj.currencyId) + String(obj.costCenterId)
      })

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (record && record.currencyId && record.fiscalYear && record.accountId && record.costCenterId !== null && recordId) {
        const res = await getRequest({
          extension: GeneralLedgerRepository.OpeningBalances.get,
          parameters: `_fiscalYear=${record.fiscalYear}&_accountId=${record.accountId}&_currencyId=${record.currencyId}&_costCenterId=${record.costCenterId}`
        })

        formik.setValues({
          ...res.record,
          recordId:
            String(record.fiscalYear * 10) + String(record.accountId) + String(record.currencyId) + String(record.costCenterId)
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.OpeningBalances} form={formik} maxAccess={maxAccess} editMode={editMode}>
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
                  formik.setFieldValue('fiscalYear', newValue?.fiscalYear ||null)
                }}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={GeneralLedgerRepository.Account.snapshot}
                name='accountId'
                readOnly={editMode}
                label={labels.accountName}
                valueField='accountRef'
                displayField='name'
                valueShow='accountRef'
                required
                secondValueShow='accountName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accountId', newValue?.recordId || '')
                  formik.setFieldValue('accountRef', newValue?.accountRef || '')
                  formik.setFieldValue('accountName', newValue?.name || '')
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
                readOnly={editMode}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.Sign}
                name='sign'
                label={labels.sign}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('sign', newValue ? newValue.key : '')
                }}
                error={formik.touched.sign && Boolean(formik.errors.sign)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='costCenterId'
                endpointId={GeneralLedgerRepository.CostCenter.qry}
                parameters={`_params=&_startAt=0&_pageSize=1000`}
                label={labels.costCenter}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('costCenterId', newValue?.recordId)
                  formik.setFieldValue('costCenterRef', newValue?.reference)
                  formik.setFieldValue('costCenterName', newValue?.name)
                }}
                error={formik.touched.costCenterId && Boolean(formik.errors.costCenterId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='amount'
                label={labels.amount}
                value={formik.values.amount}
                readOnly={editMode}
                required
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('amount', e.target.value)}
                onClear={() => formik.setFieldValue('amount', '')}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                maxLength={10}
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
