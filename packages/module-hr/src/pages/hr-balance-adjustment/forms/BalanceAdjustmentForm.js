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
import { LeaveManagementRepository } from '@argus/repositories/src/repositories/LeaveManagementRepository'
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

export default function BalanceAdjustmentForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.BalanceAdjustment,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: LeaveManagementRepository.BalanceAdjustment.page
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
      ltId: null,
      lsId: null,
      scheduleName: '',
      effectiveDate: new Date(),
      date: new Date(),
      hours: 0,
      days: 0,
      notes: '',
      status: 1
    },
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      employeeId: yup.number().required(),
      ltId: yup.number().required(),
      scheduleName: yup.string().required(),
      effectiveDate: yup.date().required(),
      date: yup.date().required(),
      hours: yup.number().required(),
      days: yup.number().required(),
      notes: yup.string().required()
    }),
    onSubmit: async obj => {
      postRequest({
        extension: LeaveManagementRepository.BalanceAdjustment.set,
        record: JSON.stringify({
          ...obj,
          effectiveDate: formatDateToApi(obj.effectiveDate),
          date: formatDateToApi(obj.date)
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
      extension: LeaveManagementRepository.BalanceAdjustment.get,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues({
      ...res.record,
      effectiveDate: formatDateFromApi(res?.record?.effectiveDate),
      date: formatDateFromApi(res?.record?.date)
    })
  }

  const editMode = !!formik.values.recordId
  const isPosted = formik?.values?.status === 3

  useEffect(() => {
    recordId && refetchForm(recordId)
  }, [])

  async function getEmployeeSchedule(ltId, employeeId) {
    if(!ltId || !employeeId) return null

    const res = await getRequest({
      extension: EmployeeRepository.Leaves.get,
      parameters: `_employeeId=${employeeId}&_ltId=${ltId}`
    })

    return res?.record || null
  }

  const onPost = async () => {
    await postRequest({
      extension: LeaveManagementRepository.BalanceAdjustment.post,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Posted)
    window.close()
    invalidate()
  }

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      disabled: true
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode
    },
  ]

  return (
    <FormShell
      resourceId={ResourceIds.BalanceAdjustment}
      functionId={SystemFunction.BalanceAdjustment}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      previewReport={editMode}
      editMode={editMode}
      disabledSubmit={isPosted}
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
                onChange={(_, newValue) => {
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
                readOnly={isPosted}
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
                readOnly={isPosted}
                name='employeeRef'
                label={labels.employee}
                secondDisplayField={true}
                required
                secondValue={formik.values.employeeName}
                onChange={async (_, newValue) => {
                  const lsRes = await getEmployeeSchedule(newValue?.recordId, formik.values.ltId)
                  formik.setFieldValue('scheduleName', lsRes?.lsName || null)
                  formik.setFieldValue('lsId', lsRes?.lsId || null)
                  
                  formik.setFieldValue('employeeRef', newValue?.reference || '')
                  formik.setFieldValue('employeeName', newValue?.fullName || '')
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                }}
                error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={LeaveManagementRepository.LeaveTypes.qry}
                name='ltId'
                label={labels.leaveType}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                required
                readOnly={isPosted}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('ltId', newValue?.recordId || null)
                  const lsRes = await getEmployeeSchedule(newValue?.recordId, formik.values.employeeId)
                  formik.setFieldValue('scheduleName', lsRes?.lsName || null)
                  formik.setFieldValue('lsId', lsRes?.lsId || null)
                }}
                error={formik.touched.ltId && Boolean(formik.errors.ltId)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField 
                name='scheduleName'
                label={labels.leaveSchedule}
                value={formik?.values?.scheduleName}
                maxAccess={maxAccess}
                readOnly
                required
                error={formik.touched.scheduleName && Boolean(formik.errors.scheduleName)}
                />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='effectiveDate'
                label={labels.effectiveDate}
                value={formik.values.effectiveDate}
                onChange={formik.setFieldValue}
                required
                readOnly={isPosted}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('effectiveDate', null)}
                error={formik.touched.effectiveDate && Boolean(formik.errors.effectiveDate)}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField
                name='days'
                label={labels.days}
                value={formik.values.days}
                onChange={formik.handleChange}
                maxLength={5}
                decimalScale={2}
                allowNegative={false}
                maxAccess={maxAccess}
                required
                readOnly={isPosted}
                onClear={() => formik.setFieldValue('days', 0)}
                error={formik.touched.days && Boolean(formik.errors.days)}
              />
            </Grid>
            <Grid item xs={3}>
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
                readOnly={isPosted}
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
                readOnly={isPosted}
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
