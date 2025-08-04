import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi, formatDateForGetApI } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import FieldSet from 'src/components/Shared/FieldSet'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { useError } from 'src/error'

export default function ResignationReqForm({ recordId, labels, maxAccess }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.ResignationRequest.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      reference: '',
      date: new Date(),
      effectiveDate: null,
      employeeId: null,
      department: null,
      position: null,
      branch: null,
      hireDate: null,
      serviceDuration: null,
      netSalary: null,
      explanation: '',
      status: 1,
      wip: 1,
      reasonId: null,
      releaseStatus: null
    },
    validateOnChange: true,
    validationSchema: yup.object({
      employeeId: yup.number().required(),
      effectiveDate: yup.date().required(),
      date: yup.date().required(),
      reasonId: yup.number().required()
    }),
    onSubmit: async obj => {
      const { hireDate, department, position, branch, serviceDuration, netSalary, ...rest } = obj
      postRequest({
        extension: EmployeeRepository.ResignationRequest.set,
        record: JSON.stringify({
          ...rest,
          date: formatDateToApi(obj.date),
          effectiveDate: formatDateToApi(obj.effectiveDate)
        })
      }).then(async res => {
        toast.success(recordId ? platformLabels.Edited : platformLabels.Added)
        await refetchForm(res.recordId)
        invalidate()
      })
    }
  })

  function refetchForm(recordId) {
    getRequest({
      extension: EmployeeRepository.ResignationRequest.get,
      parameters: `_recordId=${recordId}`
    }).then(res => {
      refetchFormJob(res.record)
    })
  }

  function refetchFormJob(res) {
    getRequest({
      extension: EmployeeRepository.EmployeeQuickView.get,
      parameters: `_recordId=${res?.employeeId}&_asOfDate=${formatDateForGetApI(formatDateFromApi(res?.date))}`
    }).then(employeeRes => {
      formik.setValues({
        ...formik.values,
        ...res,
        effectiveDate: formatDateFromApi(res?.effectiveDate),
        date: formatDateFromApi(res?.date),
        hireDate: formatDateFromApi(employeeRes?.record?.hireDate),
        department: employeeRes?.record?.departmentName,
        position: employeeRes?.record?.positionName,
        branch: employeeRes?.record?.branchName,
        serviceDuration: employeeRes?.record?.serviceDuration,
        netSalary: employeeRes?.record?.salary
      })
    })
  }

  async function fillJob(employeeId) {
    if (employeeId) {
      await getRequest({
        extension: EmployeeRepository.EmployeeQuickView.get,
        parameters: `_recordId=${employeeId}&_asOfDate=${formatDateForGetApI(formik?.values?.date)}`
      }).then(employeeRes => {
        formik.setFieldValue('hireDate', formatDateFromApi(employeeRes?.record?.hireDate) || null)
        formik.setFieldValue('department', employeeRes?.record?.departmentName || null)
        formik.setFieldValue('position', employeeRes?.record?.positionName || null)
        formik.setFieldValue('branch', employeeRes?.record?.branchName || null)
        formik.setFieldValue('serviceDuration', employeeRes?.record?.serviceDuration || null)
        formik.setFieldValue('netSalary', employeeRes?.record?.salary || null)
      })
    } else {
      formik.setFieldValue('hireDate', null)
      formik.setFieldValue('department', null)
      formik.setFieldValue('position', null)
      formik.setFieldValue('branch', null)
      formik.setFieldValue('serviceDuration', null)
      formik.setFieldValue('netSalary', null)
    }
  }

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2

  async function onClose() {
    const { hireDate, department, position, branch, serviceDuration, netSalary, ...rest } = formik?.values

    await postRequest({
      extension: EmployeeRepository.ResignationRequest.close,
      record: JSON.stringify({
        ...rest,
        date: formatDateToApi(formik?.values?.date),
        effectiveDate: formatDateToApi(formik?.values?.effectiveDate)
      })
    }).then(() => {
      toast.success(platformLabels.Closed)
      invalidate()
      refetchForm(formik?.values?.recordId)
    })
  }

  async function onReopen() {
    if (!formik?.values?.releaseStatus) {
      reopenRequest()
    } else {
      await getRequest({
        extension: DocumentReleaseRepository.ReleaseIndicator.get,
        parameters: `_recordId=${formik?.value?.releaseStatus}`
      }).then(res => {
        res?.record?.isReleased
          ? stackError({
              message: labels.documentReleasedError
            })
          : reopenRequest()
      })
    }
  }

  async function reopenRequest() {
    const { hireDate, department, position, branch, serviceDuration, netSalary, ...rest } = formik?.values

    await postRequest({
      extension: EmployeeRepository.ResignationRequest.reopen,
      record: JSON.stringify({
        ...rest,
        date: formatDateToApi(formik?.values?.date),
        effectiveDate: formatDateToApi(formik?.values?.effectiveDate)
      })
    }).then(() => {
      toast.success(platformLabels.Reopened)
      invalidate()
      refetchForm(formik?.values?.recordId)
    })
  }

  const actions = [
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
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    }
  ]

  useEffect(() => {
    if (recordId) {
      refetchForm(recordId)
    }
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.ResignationRequest}
      functionId={SystemFunction.ResignationRequest}
      form={formik}
      maxAccess={maxAccess}
      actions={actions}
      editMode={editMode}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                maxAccess={maxAccess}
                readOnly={!editMode || isClosed}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='effectiveDate'
                required
                label={labels.effectiveDate}
                value={formik?.values?.effectiveDate}
                onChange={formik.setFieldValue}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('effectiveDate', null)}
                error={formik.touched.effectiveDate && Boolean(formik.errors.effectiveDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{
                  _branchId: 0
                }}
                required
                form={formik}
                filter={{ activeStatus: 1 }}
                valueField='reference'
                displayField='fullName'
                name='employeeRef'
                readOnly={isClosed}
                label={labels.employee}
                secondFieldLabel={labels.name}
                secondDisplayField={true}
                secondValue={formik.values.employeeName}
                onChange={(event, newValue) => {
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                  formik.setFieldValue('employeeRef', newValue?.reference || null)
                  formik.setFieldValue('employeeName', newValue?.fullName || null)
                  fillJob(newValue?.recordId)
                }}
                error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='date'
                required
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
              <FieldSet title={labels.jobInfo}>
                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='department'
                        label={labels.department}
                        value={formik?.values?.department}
                        maxAccess={maxAccess}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='position'
                        label={labels.position}
                        value={formik?.values?.position}
                        maxAccess={maxAccess}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='branch'
                        label={labels.branch}
                        value={formik?.values?.branch}
                        maxAccess={maxAccess}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomDatePicker
                        name='hireDate'
                        label={labels.hireDate}
                        value={formik?.values?.hireDate}
                        readOnly
                        maxAccess={maxAccess}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <CustomTextField
                        name='serviceDuration'
                        label={labels.YIS}
                        value={formik?.values?.serviceDuration}
                        maxAccess={maxAccess}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomNumberField
                        name='netSalary'
                        label={labels.netSalary}
                        value={formik?.values?.netSalary}
                        maxAccess={maxAccess}
                        readOnly
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </FieldSet>
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={EmployeeRepository.TerminationReason.qry}
                name='reasonId'
                label={labels.reason}
                valueField='recordId'
                required
                displayField={'name'}
                readOnly={isClosed}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('reasonId', newValue?.recordId || null)
                }}
                error={formik.touched.reasonId && Boolean(formik.errors.reasonId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={7}>
              <CustomTextArea
                name='explanation'
                label={labels.explanation}
                value={formik.values.explanation}
                rows={3}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('explanation', e.target.value)}
                onClear={() => formik.setFieldValue('explanation', '')}
                error={formik.touched.explanation && Boolean(formik.errors.explanation)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
