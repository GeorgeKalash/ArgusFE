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

  async function fetchRecordById(id) {
    const res = await getRequest({
      extension: BenefitsRepository.Settlement.get,
      parameters: `_recordId=${id}`
    })

    const record = res?.record || {}
    const preview = record.preview || {}

    formik.setValues({
      ...record,
      date: formatDateFromApi(record.date),
      employeeRef: record.employee?.parent?.reference || '',
      employeeName: record.employee?.parent?.fullName || '',
      salaryId: preview.parent?.salaryId ?? null,
      payId: preview.parent?.payId ?? null,
      leaveId: preview.parent?.leaveId ?? null,
      leavePaymentId: preview.parent?.leavePaymentId ?? null,
      fsId: preview.parent?.fsId ?? null,
      paySeqNo: preview.parent?.paySeqNo ?? null,
      leavePaymentDescription: preview.leavePaymentDescription || '',
      payrollDescription: preview.payrollDescription || '',
      leaveDescription: preview.leaveDescription || '',
      terminationDescription: preview.terminationDescription || '',
      finalSettlementDescription: preview.finalSettlementDescription || ''
    })
  }

  async function handleSubmit(obj) {
    const {
      salaryId,
      payId,
      leaveId,
      leavePaymentId,
      fsId,
      paySeqNo,
      ...rest
    } = obj

    const payload = {
      ...rest,
      date: formatDateToApi(obj.date),
      ...(salaryId != null && { salaryId }),
      ...(payId != null && { payId }),
      ...(leaveId != null && { leaveId }),
      ...(leavePaymentId != null && { leavePaymentId }),
      ...(fsId != null && { fsId }),
      ...(paySeqNo != null && { paySeqNo })
    }

    const response = await postRequest({
      extension: BenefitsRepository.Settlement.set,
      record: JSON.stringify(payload)
    })

    toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
    invalidate()
    
    await fetchRecordById(response.recordId)
  }

  const editMode = !!formik.values.recordId

  async function fetchEmployeeSettlementPreview({ employeeId, date, type }) {
    if (!employeeId || !date || !type) return {}

    const res = await getRequest({
      extension: BenefitsRepository.Settlement.preview,
      parameters: `_employeeId=${employeeId}&_date=${formatDateForGetApI(date)}&_type=${type}`
    })

    const record = res?.record

    return {
      leavePaymentDescription: record?.leavePaymentDescription || '',
      payrollDescription: record?.payrollDescription || '',
      leaveDescription: record?.leaveDescription || '',
      terminationDescription: record?.terminationDescription || '',
      finalSettlementDescription: record?.finalSettlementDescription || '',
      salaryId: record?.parent?.salaryId ?? null,
      payId: record?.parent?.payId ?? null,
      leaveId: record?.parent?.leaveId ?? null,
      leavePaymentId: record?.parent?.leavePaymentId ?? null,
      fsId: record?.parent?.fsId ?? null,
      paySeqNo: record?.parent?.paySeqNo ?? null
    }
  }

  useEffect(() => {
    if (recordId) fetchRecordById(recordId)
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
                  const employeeId = newValue?.recordId || null

                  const preview = await fetchEmployeeSettlementPreview({
                    employeeId,
                    date: formik.values.date,
                    type: formik.values.type
                  })

                  formik.setValues({
                    ...formik.values,
                    employeeId,
                    employeeName: newValue?.fullName || '',
                    employeeRef: newValue?.reference || '',
                    ...preview
                  })
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
                  const preview = await fetchEmployeeSettlementPreview({
                    employeeId: formik.values.employeeId,
                    date: value,
                    type: formik.values.type
                  })

                  formik.setValues({
                    ...formik.values,
                    date: value,
                    ...preview
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
                  const type = newValue?.key ?? null

                  const preview = await fetchEmployeeSettlementPreview({
                    employeeId: formik.values.employeeId,
                    date: formik.values.date,
                    type
                  })

                  formik.setValues({
                    ...formik.values,
                    type,
                    ...preview
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
                maxLength='200'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('notes', '')}
              />
            </Grid>
             <Grid item xs={12}>
              <FieldSet title={labels.EmployeeSettlement}>
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