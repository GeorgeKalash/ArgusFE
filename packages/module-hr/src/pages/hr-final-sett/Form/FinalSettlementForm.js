import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { formatDateForGetApI, formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function FinalSettlementForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: PayrollRepository.FinalSettlement.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      fsRef: '',
      date: new Date(),
      employeeId: null,
      indemnity: null,
      notes: '',
      esName: '',
      salary: null,
      loanBalance: null,
      serviceDuration: '',
      employeeRef: '',
      employeeName: '',
      hireDate: null,
      department: '',
      positionName: ''
    },
    maxAccess,
    validationSchema: yup.object({
      employeeId: yup.number().required(),
      date: yup.date().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: PayrollRepository.FinalSettlement.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) formik.setFieldValue('recordId', response.recordId)
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: PayrollRepository.FinalSettlement.get,
          parameters: `_recordId=${recordId}`
        })

        getRequest({
          extension: EmployeeRepository.QuickView.get,
          parameters: `_recordId=${res.record?.employeeId}&_asOfDate=${
            res.record?.date ? formatDateForGetApI(formatDateFromApi(res.record?.date)) : new Date()
          }`
        }).then(employeeRes => {
          formik.setValues({
            ...formik.values,
            ...res.record,
            ...employeeRes.record,
            hireDate: formatDateFromApi(employeeRes?.record?.hireDate),
            department: employeeRes?.record?.departmentName,
            branch: employeeRes?.record?.branchName,
            date: formatDateFromApi(res.record.date),
            employeeName: employeeRes?.record?.fullName || '',
            employeeRef: employeeRes?.record?.reference || ''
          })
        })
      }
    })()
  }, [])

  const fillEmployee = async empId => {
    if (empId) {
      const res = await getRequest({
        extension: EmployeeRepository.TerminationEmployee.get,
        parameters: `_employeeId=${empId}`
      })

      getRequest({
        extension: EmployeeRepository.QuickView.get,
        parameters: `_recordId=${res?.record?.employeeId}&_asOfDate=${
          res?.record?.date ? formatDateForGetApI(formatDateFromApi(res?.record?.date)) : new Date()
        }`
      }).then(employeeRes => {
        formik.setValues({
          ...formik.values,
          ...employeeRes.record,
          employeeId: empId,
          hireDate: formatDateFromApi(employeeRes?.record?.hireDate),
          department: employeeRes?.record?.departmentName,
          positionName: employeeRes?.record?.positionName,
          branch: employeeRes?.record?.branchName,
          serviceDuration: employeeRes?.record?.serviceDuration,
          netSalary: employeeRes?.record?.salary,
          employeeRef: employeeRes?.record?.reference,
        })
      })
    }
  }

  return (
    <FormShell resourceId={ResourceIds.FinalSettlement} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='fsRef'
                    label={labels.ref}
                    value={formik.values.fsRef}
                    maxAccess={maxAccess}
                    maxLength='10'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('fsRef', '')}
                    error={formik.touched.fsRef && Boolean(formik.errors.fsRef)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='employeeRef'
                    label={labels.employeeRef}
                    value={formik.values.employeeRef}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('employeeRef', '')}
                    error={formik.touched.employeeRef && Boolean(formik.errors.employeeRef)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='date'
                    label={labels.day}
                    value={formik.values.date}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    required
                    onClear={() => formik.setFieldValue('date', null)}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={EmployeeRepository.Employee.snapshot}
                    filter={{ activeStatus: -1 }}
                    parameters={{
                      _branchId: 0
                    }}
                    form={formik}
                    maxAccess={maxAccess}
                    valueField='fullName'
                    displayField='fullName'
                    name='employeeName'
                    label={labels.employee}
                    secondDisplayField={false}
                    required
                    onChange={async (_, newValue) => {
                      await fillEmployee(newValue?.recordId)
                      formik.setFieldValue('employeeId', newValue?.recordId || null)
                    }}
                    error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='nationalityName'
                    label={labels.nationality}
                    value={formik.values.nationalityName}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('nationalityName', '')}
                    error={formik.touched.nationalityName && Boolean(formik.errors.nationalityName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='branch'
                    label={labels.branch}
                    value={formik.values.branch}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('branch', '')}
                    error={formik.touched.branch && Boolean(formik.errors.branch)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='department'
                    label={labels.department}
                    value={formik.values.department}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('department', '')}
                    error={formik.touched.department && Boolean(formik.errors.department)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='positionName'
                    label={labels.position}
                    value={formik.values.positionName}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('positionName', '')}
                    error={formik.touched.positionName && Boolean(formik.errors.positionName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDatePicker
                    name='hireDate'
                    label={labels.hireDate}
                    value={formik.values.hireDate}
                    onChange={formik.setFieldValue}
                    maxAccess={maxAccess}
                    readOnly
                    onClear={() => formik.setFieldValue('hireDate', null)}
                    error={formik.touched.hireDate && Boolean(formik.errors.hireDate)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomTextArea
                    name='notes'
                    label={labels.notes}
                    value={formik.values.notes}
                    rows={2.5}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('notes', e.target.value)}
                    onClear={() => formik.setFieldValue('notes', '')}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='esName'
                    label={labels.employmentStatus}
                    value={formik.values.esName}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('esName', '')}
                    error={formik.touched.esName && Boolean(formik.errors.esName)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomNumberField
                    name='loanBalance'
                    label={labels.loanBalance}
                    value={formik.values.loanBalance}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('loanBalance', '')}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='divisionName'
                    label={labels.division}
                    value={formik.values.divisionName}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('divisionName', '')}
                    error={formik.touched.divisionName && Boolean(formik.errors.divisionName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='reportToName'
                    label={labels.manager}
                    value={formik.values.reportToName}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reportToName', '')}
                    error={formik.touched.reportToName && Boolean(formik.errors.reportToName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='indemnity'
                    label={labels.indemnity}
                    value={formik.values.indemnity}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('indemnity', null)}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='salary'
                    label={labels.salary}
                    value={formik.values.salary}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('salary', null)}
                    readOnly
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='serviceDuration'
                    label={labels.serviceDuration}
                    value={formik.values.serviceDuration}
                    maxAccess={maxAccess}
                    readOnly
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('serviceDuration', '')}
                    error={formik.touched.serviceDuration && Boolean(formik.errors.serviceDuration)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
