import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { formatDateFromApi, formatDateToISO } from '@argus/shared-domain/src/lib/date-helper'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ChangeDeductionsAmount, ChangeEntitlementsAmount } from '@argus/shared-utils/src/utils/Payroll'

export default function SalaryTab({
  labels,
  maxAccess,
  store,
  setStore,
  employeeInfo,
  setSalaryInfo,
  data,
  refetchSalaryTab,
  reCalcNewAmounts,
  saveWholePack,
  window
}) {
  const { recordId } = store
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const entitlements = data?.filter(record => record.type == 1) || []
  const deductions = data?.filter(record => record.type == 2) || []

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.EmployeeSalary.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      employeeId: employeeInfo?.recordId,
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
      finalAmount: null,
      eAmount: null,
      dAmount: null
    },
    validationSchema: yup.object({
      currencyId: yup.number().required(),
      scrId: yup.number().required(),
      effectiveDate: yup.date().required(),
      salaryType: yup.number().required(),
      paymentFrequency: yup.number().required(),
      paymentMethod: yup.number().required(),
      basicAmount: yup.number().required(),
      bankId: yup
        .number()
        .nullable()
        .test(function (value) {
          const { paymentMethod } = this.parent

          return paymentMethod == 2 ? !!value : true
        }),
      accountNumber: yup
        .number()
        .nullable()
        .test(function (value) {
          const { paymentMethod } = this.parent

          return paymentMethod == 2 ? !!value : true
        })
    }),
    onSubmit: async obj => {
      if (obj.recordId && saveWholePack.current && data.length > 0) {
        await postRequest({
          extension: EmployeeRepository.SalaryDetails.set2,
          record: JSON.stringify({
            salary: { ...obj, effectiveDate: formatDateToISO(new Date(obj.effectiveDate)) },
            salaryDetails: data
          })
        })
        toast.success(platformLabels.Edited)
        invalidate()
        saveWholePack.current = false
        window.close()
      } else {
        const res = await postRequest({
          extension: EmployeeRepository.EmployeeSalary.set,
          record: JSON.stringify({ ...obj, effectiveDate: formatDateToISO(new Date(obj.effectiveDate)) })
        })
        toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
        invalidate()
        getSalaryInfo(res?.recordId)
        if (!obj.recordId)
          setStore(prevStore => ({
            ...prevStore,
            recordId: res?.recordId
          }))
        else window.close()
      }
    }
  })
  const editMode = !!formik?.values?.recordId

  async function updateAmountFields(basicAmount) {
    const totalEN = recordId ? (basicAmount ? await ChangeEntitlementsAmount(entitlements, basicAmount) : 0) : 0
    const totalDE = recordId ? (basicAmount ? await ChangeDeductionsAmount(deductions, basicAmount, totalEN) : 0) : 0
    const finalAmount = basicAmount ? totalEN - totalDE + basicAmount : 0
    setSalaryInfo(prev => ({
      ...prev,
      basicAmount: basicAmount || 0
    }))
    reCalcNewAmounts(basicAmount, totalEN)

    formik.setFieldValue('finalAmount', parseFloat(finalAmount).toFixed(2))
    formik.setFieldValue('eAmount', parseFloat(totalEN).toFixed(2))
    formik.setFieldValue('dAmount', parseFloat(totalDE).toFixed(2))
    formik.setFieldValue('basicAmount', basicAmount)
  }

  async function getSalaryInfo(recordId) {
    const res = await getRequest({
      extension: EmployeeRepository.EmployeeSalary.get,
      parameters: `_recordId=${recordId}`
    })
    formik.setValues({
      ...res?.record,
      effectiveDate: formatDateFromApi(res.record.effectiveDate),
      finalAmount: parseFloat(res?.record?.finalAmount).toFixed(2),
      eAmount: parseFloat(res?.record?.eAmount).toFixed(2),
      dAmount: parseFloat(res?.record?.dAmount).toFixed(2)
    })
    setSalaryInfo({ ...res?.record, effectiveDate: formatDateFromApi(res.record.effectiveDate) })
    setStore(prevStore => ({
      ...prevStore,
      currency: res?.record?.currencyRef
    }))
    refetchSalaryTab.current = false
  }

  useEffect(() => {
    if (recordId && refetchSalaryTab.current) getSalaryInfo(recordId)
  }, [refetchSalaryTab.current])

  useEffect(() => {
    ;(async function () {
      if (!recordId) {
        const res = await getRequest({
          extension: EmployeeRepository.EmployeeSalary.qry,
          parameters: `_employeeId=${employeeInfo?.recordId}`
        })
        let lastSalary = null

        if (res?.list?.length > 0) {
          lastSalary = res.list
            .sort((a, b) => {
              const dateA = new Date(parseInt(a.effectiveDate.match(/\d+/)[0]))
              const dateB = new Date(parseInt(b.effectiveDate.match(/\d+/)[0]))

              return dateA - dateB
            })
            .at(-1)

          const updatedSalary = {
            ...lastSalary,
            eAmount: '0.00',
            dAmount: '0.00',
            finalAmount: parseFloat(lastSalary.basicAmount).toFixed(2),
            effectiveDate: new Date(),
            recordId: null
          }

          formik.setValues(updatedSalary)
          setStore(prevStore => ({
            ...prevStore,
            currency: lastSalary.currencyRef
          }))
        } else {
          const res = await getRequest({
            extension: EmployeeRepository.Employee.get1,
            parameters: `_recordId=${employeeInfo?.recordId}`
          })
          formik.setFieldValue('effectiveDate', res.record.hireDate ? formatDateFromApi(res.record.hireDate) : null)
        }
      } else getSalaryInfo(recordId)
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Salaries} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
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
              onChange={(_, newValue) => formik.setFieldValue('currencyId', newValue?.recordId || null)}
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
              onChange={(_, newValue) => formik.setFieldValue('scrId', newValue?.recordId || null)}
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
              onChange={e => updateAmountFields(e?.target?.value ? Number(e.target.value.replace(/,/g, '')) : null)}
              required
              maxLength={10}
              maxAccess={maxAccess}
              allowNegative={false}
              onClear={() => updateAmountFields(null)}
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
              onChange={(_, newValue) => {
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
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('finalAmount', null)}
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
              onChange={(_, newValue) => formik.setFieldValue('paymentFrequency', newValue?.key || null)}
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
              maxAccess={maxAccess}
              onClear={() => formik.setFieldValue('eAmount', null)}
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
              onChange={(_, newValue) => {
                if (newValue?.key != 2) {
                  formik.setFieldValue('bankId', '')
                  formik.setFieldValue('accountNumber', '')
                }
                formik.setFieldValue('paymentMethod', newValue?.key || null)
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
              maxAccess={maxAccess}
              onClear={() => formik.setFieldValue('dAmount', null)}
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
              onChange={(_, newValue) => formik.setFieldValue('bankId', newValue?.recordId || null)}
              error={formik.touched.bankId && Boolean(formik.errors.bankId)}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}
