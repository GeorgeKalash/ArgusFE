import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { LoanManagementRepository } from '@argus/repositories/src/repositories/LoanManagementRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'

export default function BalanceAdjustmentForm({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.BalanceAdjustment,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: LoanManagementRepository.BalanceAdjustment.page
  })

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId: null,
      dtId: null,
      reference: '',
      employeeId: null,
      employeeRef: '',
      employeeName: '',
      lsId: null,
      leaveTrackTime: null,
      effectiveDate: new Date(),
      date: new Date(),
      hours: null,
      duration: null,
      notes: '',
      status: 1
    },
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      employeeId: yup.number().required(),
      lsId: yup.number().required(),
      leaveTrackTime: yup.number().required(),
      effectiveDate: yup.date().required(),
      date: yup.date().required(),
      hours: yup.number().required(),
      notes: yup.string().required()
    }),
    onSubmit: async obj => {
      postRequest({
        extension: LoanManagementRepository.BalanceAdjustment.set,
        record: JSON.stringify({
          ...obj,
          effectiveDate: formatDateToApi(obj.effectiveDate),
          date: formatDateToApi(obj.date),
          duration: obj.hours
        })
      }).then(async res => {
        toast.success(obj?.recordId ? platformLabels.Edited : platformLabels.Added)
        await refetchForm(res.recordId)
        invalidate()
      })
    }
  })

  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: LoanManagementRepository.BalanceAdjustment.get,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues({
      ...res.record,
      effectiveDate: formatDateFromApi(res?.record?.effectiveDate),
      date: formatDateFromApi(res?.record?.date)
    })
  }

  const editMode = !!formik.values.recordId

  useEffect(() => {
    recordId && refetchForm(recordId)
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.BalanceAdjustment}
      functionId={SystemFunction.BalanceAdjustment}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.BalanceAdjustment}`}
                name='dtId'
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly={editMode}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                  changeDT(newValue)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                maxAccess={!editMode && maxAccess}
                readOnly={editMode}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values?.date}
                onChange={formik.setFieldValue}
                disabledDate={'>='}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{
                  _branchId: 0
                }}
                form={formik}
                maxAccess={maxAccess}
                valueField='reference'
                displayField='fullName'
                name='employeeRef'
                label={labels.employee}
                secondDisplayField={true}
                required
                secondValue={formik.values.employeeName}
                onChange={(event, newValue) => {
                  formik.setFieldValue('employeeRef', newValue?.reference || '')
                  formik.setFieldValue('employeeName', newValue?.fullName || '')
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                }}
                error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={LoanManagementRepository.LeaveScheduleFilters.qry}
                name='lsId'
                label={labels.leaveSchedule}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                required
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('lsId', newValue?.recordId || null)
                }}
                error={formik.touched.lsId && Boolean(formik.errors.lsId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.LEAVE_TRACK_TIME}
                label={labels.leaveTrackTime}
                name='leaveTrackTime'
                values={formik.values}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('leaveTrackTime', newValue?.key || null)
                }}
                error={formik.touched.leaveTrackTime && Boolean(formik.errors.leaveTrackTime)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='effectiveDate'
                label={labels.effectiveDate}
                value={formik.values.effectiveDate}
                onChange={formik.setFieldValue}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('effectiveDate', null)}
                error={formik.touched.effectiveDate && Boolean(formik.errors.effectiveDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='hours'
                label={labels.hours}
                value={formik.values.hours}
                onChange={formik.handleChange}
                maxLength={6}
                decimalScale={2}
                allowNegative={false}
                maxAccess={maxAccess}
                required
                onClear={() => formik.setFieldValue('hours', 0)}
                error={formik.touched.hours && Boolean(formik.errors.hours)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                maxLength='200'
                rows={3}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
