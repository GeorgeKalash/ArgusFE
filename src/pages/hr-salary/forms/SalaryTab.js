import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { CashBankRepository } from 'src/repositories/CashBankRepository'

export default function SalaryTab({ labels, maxAccess, store, setStore }) {
  const { recordId } = store
  const { getRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      currencyId: '',
      changeReason: '',
      date: null,
      salaryType: null,
      paymentFrequencyId: null,
      paymentMethod: null,
      bankId: null,
      IBAN: null,
      comments: '',
      basicAmount: 0,
      finalAmount: 0,
      totalEntitlements: 0,
      totalDeductions: 0
    },
    validateOnChange: false,
    validationSchema: yup.object({
    }),
    onSubmit: async values => {
      
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Machines} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
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
        <Grid item xs={6}>
          <CustomNumberField
            name='IBAN'
            label={labels.IBAN}
            value={formik.values.IBAN}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('IBAN', '')}
            error={formik.touched.IBAN && Boolean(formik.errors.IBAN)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            endpointId={SystemRepository.Currency.qry}
            name='changeReasonId'
            label={labels.changeReason}
            valueField='recordId'
            displayField={['reference', 'name']}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('changeReasonId', newValue?.recordId || null)
              formik.setFieldValue('changeReasonRef', newValue?.reference || '')
            }}
            error={formik.touched.changeReasonId && Boolean(formik.errors.changeReasonId)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField
            name='comments'
            label={labels.comments}
            value={formik.values?.comments}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('comments', '')}
            error={formik.touched.comments && Boolean(formik.errors.comments)}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomDatePicker
            name='date'
            label={labels.date}
            value={formik?.values?.date}
            onChange={formik.setFieldValue}
            maxAccess={maxAccess}
            onClear={() => formik.setFieldValue('date', null)}
            error={formik.touched.date && Boolean(formik.errors.date)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomNumberField
            name='basicAmount'
            label={labels.basicAmount}
            value={formik.values.basicAmount}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('basicAmount', 0)}
            error={formik.touched.basicAmount && Boolean(formik.errors.basicAmount)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            endpointId={SystemRepository.Currency.qry}
            name='salaryTypeId'
            label={labels.salaryType}
            valueField='recordId'
            displayField={['reference', 'name']}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('salaryTypeId', newValue?.recordId || null)
              formik.setFieldValue('salaryTypeRef', newValue?.reference || '')
            }}
            error={formik.touched.salaryTypeId && Boolean(formik.errors.salaryTypeId)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomNumberField
            name='finalAmount'
            label={labels.finalAmount}
            value={formik.values.finalAmount}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('finalAmount', 0)}
            error={formik.touched.finalAmount && Boolean(formik.errors.finalAmount)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            endpointId={SystemRepository.Currency.qry}
            name='paymentFrequencyId'
            label={labels.paymentFrequency}
            valueField='recordId'
            displayField={['reference', 'name']}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('paymentFrequencyId', newValue?.recordId || null)
              formik.setFieldValue('paymentFrequencyRef', newValue?.reference || '')
            }}
            error={formik.touched.paymentFrequencyId && Boolean(formik.errors.paymentFrequencyId)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomNumberField
            name='totalEntitlements'
            label={labels.totalEntitlements}
            value={formik.values.totalEntitlements}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('totalEntitlements', 0)}
            error={formik.touched.totalEntitlements && Boolean(formik.errors.totalEntitlements)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            datasetId={DataSets.PAYMENT_METHOD}
            name='paymentMethod'
            label={labels.paymentMethod}
            valueField='key'
            displayField='value'
            values={formik.values}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('paymentMethod', newValue?.key || null)
            }}
            error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomNumberField
            name='totalDeductions'
            label={labels.totalDeductions}
            value={formik.values.totalDeductions}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('totalDeductions', 0)}
            error={formik.touched.totalDeductions && Boolean(formik.errors.totalDeductions)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={CashBankRepository.CbBank.qry}
            name='bankId'
            label={labels.bank}
            valueField='recordId'
            displayField={'name'}
            columnsInDropDown={[{ key: 'name', value: 'name' }]}
            values={formik.values}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('bankId', newValue?.recordId || null)
            }}
            error={formik.touched.bankId && Boolean(formik.errors.bankId)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
