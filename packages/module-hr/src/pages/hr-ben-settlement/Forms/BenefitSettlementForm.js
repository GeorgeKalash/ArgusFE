import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { BenefitsRepository } from '@argus/repositories/src/repositories/BenefitsRepository'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { formatDateForGetApI, formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import FieldSet from '@argus/shared-ui/src/components/Shared/FieldSet'

export default function BenefitSettlementForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: BenefitsRepository.Settlement.page
  })

  const initialValues = {
    recordId: recordId || null,
    settlementRef: '',
    employeeId: null,
    employeeName: '',
    date: new Date(),
    type: null,
    notes: '',
    salaryId: null,
    payId: null,
    leaveId: null,
    leavePaymentId: null,
    fsId: null,
    paySeqNo: null,
    leavePaymentDescription: '',
    payrollDescription: '',
    leaveDescription: '',
    terminationDescription: '',
    finalSettlementDescription: ''
  }

  const { formik } = useForm({
    maxAccess,
    initialValues,
    validationSchema: yup.object({
      employeeId: yup.number().required(),
      date: yup.date().required(),
      type: yup.string().required()
    }),
    onSubmit: handleSubmit
  })

  async function handleSubmit(obj) {
    const payload = {
      ...obj,
      date: formatDateToApi(obj.date),
      ...(obj.payId != null && { payId: obj.payId }),
      ...(obj.salaryId != null && { salaryId: obj.salaryId }),
      ...(obj.leaveId != null && { leaveId: obj.leaveId }),
      ...(obj.leavePaymentId != null && { leavePaymentId: obj.leavePaymentId }),
      ...(obj.fsId != null && { fsId: obj.fsId }),
      ...(obj.paySeqNo != null && { paySeqNo: obj.paySeqNo })
    }

    const response = await postRequest({
      extension: BenefitsRepository.Settlement.set,
      record: JSON.stringify(payload)
    })

    if (!obj.recordId) {
      formik.setFieldValue('recordId', response.recordId)

      const recRes = await getRequest({
        extension: BenefitsRepository.Settlement.get,
        parameters: `_recordId=${response.recordId}`
      })
      formik.setFieldValue('settlementRef', recRes?.record?.settlementRef || recRes?.record?.preview?.parent?.settlementRef || '')
    }

    toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
    invalidate()
  }

  const editMode = !!formik.values.recordId

  async function fetchEmployeeSettlementPreview({ employeeId, date, type }) {
    if (!employeeId || !date || !type) return

    const res = await getRequest({
      extension: BenefitsRepository.Settlement.preview,
      parameters: `_employeeId=${employeeId}&_date=${formatDateForGetApI(date)}&_type=${type}`
    })

    formik.setFieldValue('leavePaymentDescription', res?.record?.leavePaymentDescription || '')
    formik.setFieldValue('payrollDescription', res?.record?.payrollDescription || '')
    formik.setFieldValue('leaveDescription', res?.record?.leaveDescription || '')
    formik.setFieldValue('terminationDescription', res?.record?.terminationDescription || '')
    formik.setFieldValue('finalSettlementDescription', res?.record?.finalSettlementDescription || '')
    formik.setFieldValue('salaryId', res?.record?.parent?.salaryId ?? null)
    formik.setFieldValue('payId', res?.record?.parent?.payId ?? null)
    formik.setFieldValue('leaveId', res?.record?.parent?.leaveId ?? null)
    formik.setFieldValue('leavePaymentId', res?.record?.parent?.leavePaymentId ?? null)
    formik.setFieldValue('fsId', res?.record?.parent?.fsId ?? null)
    formik.setFieldValue('paySeqNo', res?.record?.parent?.paySeqNo ?? null)
  }

  const fetchRecord = async () => {
    if (!recordId) return

    const res = await getRequest({
      extension: BenefitsRepository.Settlement.get,
      parameters: `_recordId=${recordId}`
    })

    const record = res?.record || {}
    const preview = record.preview || {}

    formik.setValues({
      ...record,
      date: formatDateFromApi(record.date),
      employeeRef: record.employee?.parent?.reference || '',
      employeeName: record.employee?.parent?.fullName || '',
      salaryId: preview.parent?.salaryId ?? record.salaryId ?? null,
      payId: preview.parent?.payId ?? record.payId ?? null,
      leaveId: preview.parent?.leaveId ?? record.leaveId ?? null,
      leavePaymentId: preview.parent?.leavePaymentId ?? record.leavePaymentId ?? null,
      fsId: preview.parent?.fsId ?? record.fsId ?? null,
      paySeqNo: preview.parent?.paySeqNo ?? record.paySeqNo ?? null,
      leavePaymentDescription: preview.leavePaymentDescription || '',
      payrollDescription: preview.payrollDescription || '',
      leaveDescription: preview.leaveDescription || '',
      terminationDescription: preview.terminationDescription || '',
      finalSettlementDescription: preview.finalSettlementDescription || ''
    })
  }

  useEffect(() => {
    fetchRecord()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.BenefitSettlement}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='settlementRef'
                label={labels.reference}
                value={formik.values.settlementRef}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{ _startAt: 0, _branchId: 0 }}
                name='employeeId'
                label={labels.employee}
                valueField='reference'
                displayField='fullName'
                valueShow='employeeRef'
                secondValueShow='employeeName'
                form={formik}
                required
                maxAccess={maxAccess}
                displayFieldWidth={2}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'fullName', value: 'Name' }
                ]}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('employeeName', newValue?.fullName || '')
                  formik.setFieldValue('employeeRef', newValue?.reference || '')

                  await fetchEmployeeSettlementPreview({
                    employeeId: newValue?.recordId,
                    date: formik.values.date,
                    type: formik.values.type
                  })
                  
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                }}
                error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values.date}
                required
                maxAccess={maxAccess}
                onChange={async (name, value) => {
                  formik.setFieldValue(name, value)

                  await fetchEmployeeSettlementPreview({
                    employeeId: formik.values.employeeId,
                    date: value,
                    type: formik.values.type
                  })
                }}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.BENEFIT_SETTLEMENT_TYPE}
                name='type'
                label={labels.type}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('type', newValue?.key ?? null)

                  await fetchEmployeeSettlementPreview({
                    employeeId: formik.values.employeeId,
                    date: formik.values.date,
                    type: newValue?.key
                  })
                }}
                error={formik.touched.type && Boolean(formik.errors.type)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                rows={3}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('notes', '')}
              />
            </Grid>
             <Grid item xs={12}>
              <FieldSet title={labels.BenefitSettlement}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='leavePaymentDescription'
                    label={labels.leavePaymentDescription}
                    value={formik.values.leavePaymentDescription}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='payrollDescription'
                    label={labels.payrollDescription}
                    value={formik.values.payrollDescription}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='leaveDescription'
                    label={labels.leaveDescription}
                    value={formik.values.leaveDescription}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='terminationDescription'
                    label={labels.terminationDescription}
                    value={formik.values.terminationDescription}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='finalSettlementDescription'
                    label={labels.finalSettlementDescription}
                    value={formik.values.finalSettlementDescription}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
              </FieldSet>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}