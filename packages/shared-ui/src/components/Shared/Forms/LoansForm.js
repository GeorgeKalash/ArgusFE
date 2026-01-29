import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { LoanTrackingRepository } from '@argus/repositories/src/repositories/LoanTrackingRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { formatDateMDY, formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'

export default function LoansForm({ labels, maxAccess, store, setStore, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: LoanTrackingRepository.Loans.page
  })

  const defaultCurrency = defaultsData?.list?.find(({ key }) => key === 'currencyId')?.value
  const defaultMethod = defaultsData?.list?.find(({ key }) => key === 'ldMethod')?.value
  const defaultLdValue = defaultsData?.list?.find(({ key }) => key === 'ldValue')?.value

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      status: 1,
      releaseStatus: null,
      wip: 1,
      reference: '',
      date: new Date(),
      employeeId: null,
      branchId: null,
      departmentName: '',
      positionName: '',
      ltId: null,
      ltName: '',
      loanBalance: null,
      currencyId: parseInt(defaultCurrency),
      amount: null,
      purpose: '',
      effectiveDate: new Date(),
      ldMethod: parseInt(defaultMethod),
      ldmName: '',
      ldValue: parseInt(defaultLdValue),
      disableEditing: false
    },
    maxAccess,
    validationSchema: yup.object({
      reference: yup.string().required(),
      employeeId: yup.number().required(),
      date: yup.date().required(),
      ltId: yup.number().required(),
      currencyId: yup.number().required(),
      amount: yup.number().min(1).required(),
      purpose: yup.string().required(),
      ldValue: yup.number().min(1).required(),
      effectiveDate: yup.date().required(),
      ldMethod: yup.number().required()
    }),
    onSubmit: async obj => {
      const data = {
        ...obj,
        date: formatDateToApi(obj.date),
        effectiveDate: formatDateToApi(obj.effectiveDate)
      }

      await postRequest({
        extension: LoanTrackingRepository.Loans.set,
        record: JSON.stringify(data)
      })

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      invalidate()
      window.close()
    }
  })

  const editMode = !!formik?.values?.recordId
  const isClosed = formik.values.wip == 2

  useEffect(() => {
    if (recordId) {
      fetchData(recordId)
    }
  }, [])

  const fetchData = async id => {
    const res = await getRequest({
      extension: LoanTrackingRepository.Loans.get,
      parameters: `_recordId=${id}`
    })

    if (res?.record) {
      const { record } = res

      formik.setValues({
        ...record,
        date: formatDateFromApi(record.date),
        effectiveDate: formatDateFromApi(record.effectiveDate)
      })

      setStore(prev => ({
        ...prev,
        isClosed: record.wip === 2,
        loanAmount: record.amount ?? 0,
        effectiveDate: formatDateFromApi(res.record.effectiveDate)
      }))

      await fetchEmployee(record.employeeId)
    }

    return res
  }

  const fetchEmployee = async id => {
    if (!id) {
      resetEmployeeFields()

      return
    }

    const result = await getRequest({
      extension: EmployeeRepository.QuickView.get,
      parameters: `_recordId=${id}&_asOfDate=${formatDateMDY(new Date())}`
    })

    const { record } = result

    formik.setValues(prev => ({
      ...prev,
      employeeId: id,
      employeeRef: record?.reference || '',
      employeeName: record?.fullName || '',
      positionName: record?.positionName || '',
      departmentName: record?.departmentName || '',
      loanBalance: record?.loanBalance ?? 0,
      branchId: record?.branchId || null
    }))
  }

  const resetEmployeeFields = () => {
    formik.setValues(prev => ({
      ...prev,
      employeeId: null,
      employeeRef: '',
      employeeName: '',
      positionName: '',
      departmentName: '',
      loanBalance: 0,
      branchId: null
    }))
  }

  const refetchForm = async id => {
    const res = await fetchData(id)

    if (res?.record) {
      formik.setValues(prev => ({
        ...prev,
        ...res.record,
        date: formatDateFromApi(res.record.date),
        effectiveDate: formatDateFromApi(res.record.effectiveDate)
      }))

      setStore(prev => ({
        ...prev,
        isClosed: res.record.wip === 2,
        effectiveDate: formatDateFromApi(res.record.effectiveDate)
      }))
    }
  }

  const onClose = async () => {
    const res = await postRequest({
      extension: LoanTrackingRepository.Loans.close,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Closed)
    invalidate()
    refetchForm(res.recordId)
  }

  const onReopen = async () => {
    const res = await postRequest({
      extension: LoanTrackingRepository.Loans.reopen,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Reopened)
    invalidate()
    refetchForm(res.recordId)
  }

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed || !editMode
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.Loans}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      disabledSubmit={isClosed}
      functionId={SystemFunction.LoanRequest}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                maxLength='20'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                max={formik.values.effectiveDate}
                readOnly={isClosed}
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{ _branchId: 0 }}
                valueField='reference'
                displayField='fullName'
                name='employeeId'
                required
                readOnly={isClosed}
                displayFieldWidth={2}
                label={labels.employeeName}
                form={formik}
                valueShow='employeeRef'
                secondValueShow='employeeName'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'fullName', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  fetchEmployee(newValue?.recordId || null)
                }}
                errorCheck={'employeeId'}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.BranchFilters.qry}
                name='branchId'
                label={labels.branch}
                readOnly
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('branchId', newValue?.recordId || null)}
                error={formik.touched.branchId && Boolean(formik.errors.branchId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='departmentName'
                label={labels.department}
                value={formik.values.departmentName}
                readOnly
                maxAccess={maxAccess}
                error={formik.touched.departmentName && Boolean(formik.errors.departmentName)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='positionName'
                label={labels.position}
                value={formik.values.positionName}
                readOnly
                maxAccess={maxAccess}
                error={formik.touched.positionName && Boolean(formik.errors.positionName)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={LoanTrackingRepository.LoanType.qry}
                name='ltId'
                label={labels.ltype}
                required
                readOnly={isClosed}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('disableEditing', newValue?.disableEditing || false)
                  formik.setFieldValue('ldMethod', newValue?.ldMethod || null)
                  formik.setFieldValue('ldValue', newValue?.ldValue || 0)
                  formik.setFieldValue('ltId', newValue?.recordId || null)
                }}
                error={formik.touched.ltId && Boolean(formik.errors.ltId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='loanBalance'
                label={labels.loanBalance}
                value={formik?.values?.loanBalance}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                filter={item => item.currencyType === 1}
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
                readOnly={isClosed}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('currencyName', newValue?.name || '')
                  formik.setFieldValue('currencyRef', newValue?.reference || '')
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='amount'
                label={labels.amount}
                value={formik.values.amount}
                required
                readOnly={isClosed}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('amount', e.target.value)}
                onClear={async () => {
                  formik.setFieldValue('amount', null)
                }}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                maxLength={10}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='purpose'
                label={labels.purpose}
                required
                rows={2}
                readOnly={isClosed}
                value={formik.values.purpose}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('purpose', e.target.value)}
                onClear={() => formik.setFieldValue('purpose', '')}
                error={formik.touched.purpose && Boolean(formik.errors.purpose)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='effectiveDate'
                label={labels.effectiveDate}
                value={formik?.values?.effectiveDate}
                required
                min={formik.values.date}
                readOnly={isClosed}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('effectiveDate', null)}
                error={formik.touched.effectiveDate && Boolean(formik.errors.effectiveDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.LOAN_DEDUCTION_METHOD}
                name='ldMethod'
                label={labels.ldMethod}
                required
                readOnly={isClosed || formik.values.disableEditing}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('ldMethod', newValue?.key || null)}
                onClear={async () => {
                  formik.setFieldValue('ldMethod', null)
                  formik.setFieldValue('ldValue', null)
                }}
                error={formik.touched.ldMethod && Boolean(formik.errors.ldMethod)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='ldValue'
                label={labels.ldValue}
                value={formik.values.ldValue}
                required
                readOnly={isClosed || formik.values.disableEditing}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('ldValue', e.target.value)}
                onClear={() => formik.setFieldValue('ldValue', null)}
                error={formik.touched.ldValue && Boolean(formik.errors.ldValue)}
                maxLength={10}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
