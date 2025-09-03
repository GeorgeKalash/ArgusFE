import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { DataSets } from 'src/resources/DataSets'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

export default function SalaryTab({ labels, maxAccess, store, setStore, employeeInfo }) {
  const { recordId } = store
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      currencyId: null,
      scrId: null,
      effectiveDate: null,
      salaryType: null,
      paymentFrequency: null,
      paymentMethod: null,
      bankId: null,
      accountNumber: null,
      comments: '',
      basicAmount: '',
      finalAmount: '',
      eAmount: '',
      dAmount: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      currencyId: yup.string().required(),
      scrId: yup.string().required(),
      effectiveDate: yup.date().required(),
      salaryType: yup.string().required(),
      paymentFrequency: yup.string().required(),
      paymentMethod: yup.string().required(),
      basicAmount: yup.number().required(),
      bankId: yup.string().test('bank-required', 'Bank is required', function (value) {
        const { paymentMethod } = this.parent

        return paymentMethod == 2 ? !!value : true
      }),

      accountNumber: yup.string().test('account-required', 'Account number is required', function (value) {
        const { paymentMethod } = this.parent

        return paymentMethod == 2 ? !!value : true
      })
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: EmployeeRepository.EmployeeSalary.set,
        record: JSON.stringify({ ...obj, effectiveDate: formatDateToApi(obj.effectiveDate) })
      })
      const actionMessage = obj.recordId ? platformLabels.Edited : platformLabels.Added
      toast.success(actionMessage)
      invalidate()
    }
  })
  const editMode = !!formik?.values?.recordId

  useEffect(() => {
    ;(async function () {
      if (!recordId) {
        const res = await getRequest({
          extension: EmployeeRepository.EmployeeSalary.qry,
          parameters: `_employeeId=${employeeInfo?.recordId}`
        })
        let lastSalary = null

        if (res?.list?.length > 0) {
          lastSalary = res.list.sort((a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate)).at(-1)

          const updatedSalary = {
            ...lastSalary,
            eAmount: 0,
            dAmount: 0,
            finalAmount: lastSalary.basicAmount,
            effectiveDate: new Date()
          }

          formik.setValues(updatedSalary)
        } else {
          const res = await getRequest({
            extension: EmployeeRepository.Employee.get1,
            parameters: `_recordId=${employeeInfo?.recordId}`
          })
          formik.setFieldValue('effectiveDate', res.record.hireDate ? formatDateFromApi(res.record.hireDate) : null)
        }
      } else {
        const res = await getRequest({
          extension: EmployeeRepository.EmployeeSalary.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues({ ...res?.record, effectiveDate: formatDateFromApi(res.record.effectiveDate) })
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
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => formik.setFieldValue('currencyId', newValue?.recordId || '')}
            error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomTextField
            name='accountNumber'
            label={labels.iban}
            value={formik?.values?.accountNumber}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            readOnly={formik.values.paymentMethod != 2}
            required={formik.values.paymentMethod == 2}
            onClear={() => formik.setFieldValue('accountNumber', '')}
            error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            endpointId={EmployeeRepository.SalaryChangeReason.qry}
            name='scrId'
            label={labels.changeReason}
            valueField='recordId'
            displayField='name'
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('scrId', newValue?.recordId || null)
            }}
            error={formik.touched.scrId && Boolean(formik.errors.scrId)}
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
            name='effectiveDate'
            label={labels.date}
            value={formik?.values?.effectiveDate}
            onChange={formik.setFieldValue}
            maxAccess={maxAccess}
            required
            onClear={() => formik.setFieldValue('effectiveDate', null)}
            error={formik.touched.effectiveDate && Boolean(formik.errors.effectiveDate)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomNumberField
            name='basicAmount'
            label={labels.basicAmount}
            value={formik?.values?.basicAmount}
            onChange={formik.handleChange}
            required
            onClear={() => formik.setFieldValue('basicAmount', '')}
            error={formik.touched.basicAmount && Boolean(formik.errors.basicAmount)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            datasetId={DataSets.SALARY_TYPE}
            name='salaryType'
            label={labels.salaryType}
            valueField='key'
            displayField='value'
            values={formik.values}
            maxAccess={maxAccess}
            required
            onChange={(event, newValue) => {
              formik.setFieldValue('salaryType', newValue?.key || null)
            }}
            error={formik.touched.salaryType && Boolean(formik.errors.salaryType)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomNumberField
            name='finalAmount'
            label={labels.finalAmount}
            value={formik?.values?.finalAmount}
            readOnly
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('finalAmount', '')}
            error={formik.touched.finalAmount && Boolean(formik.errors.finalAmount)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            datasetId={DataSets.PY_PAY_PERIOD}
            name='paymentFrequency'
            label={labels.paymentFrequency}
            valueField='key'
            displayField='value'
            values={formik.values}
            maxAccess={maxAccess}
            required
            onChange={(event, newValue) => {
              formik.setFieldValue('paymentFrequency', newValue?.key || null)
            }}
            error={formik.touched.paymentFrequency && Boolean(formik.errors.paymentFrequency)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomNumberField
            name='eAmount'
            label={labels.totalEntitlements}
            value={formik?.values?.eAmount}
            onChange={formik.handleChange}
            readOnly
            onClear={() => formik.setFieldValue('eAmount', '')}
            error={formik.touched.eAmount && Boolean(formik.errors.eAmount)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            datasetId={DataSets.HR_PAYMENT_METHOD}
            name='paymentMethod'
            label={labels.paymentMethod}
            valueField='key'
            displayField='value'
            values={formik.values}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('paymentMethod', newValue?.key || null)
              if (newValue?.key != 2) {
                formik.setFieldValue('bankId', '')
                formik.setFieldValue('accountNumber', '')
              }
            }}
            required
            error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
          />
        </Grid>
        <Grid item xs={6}>
          <CustomNumberField
            name='dAmount'
            label={labels.totalDeductions}
            value={formik?.values?.dAmount}
            onChange={formik.handleChange}
            readOnly
            onClear={() => formik.setFieldValue('dAmount', '')}
            error={formik.touched.dAmount && Boolean(formik.errors.dAmount)}
          />
        </Grid>
        <Grid item xs={6}>
          <ResourceComboBox
            endpointId={CashBankRepository.CbBank.qry}
            name='bankId'
            label={labels.bank}
            valueField='recordId'
            displayField={['reference', 'name']}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            readOnly={formik.values.paymentMethod != 2}
            required={formik.values.paymentMethod == 2}
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
