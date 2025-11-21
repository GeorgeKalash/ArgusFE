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
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'

export default function JobInfoForm({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.JobInfo,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.JobInfo.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      employeeId: null,
      employeeName: '',
      employeeRef: '',
      date: new Date(),
      departmentId: null,
      branchId: null,
      divisionId: null,
      positionId: null,
      reportToId: null,
      reportToName: '',
      reportToRef: '',
      notes: '',
      status: 1,
      wip: 1
    },
    validateOnChange: true,
    validationSchema: yup.object({
      employeeId: yup.number().required(),
      date: yup.date().max(new Date(), 'Date cannot be in the future').required(),
      departmentId: yup.number().required(),
      branchId: yup.number().required(),
      positionId: yup.number().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: EmployeeRepository.JobInfo.set,
        record: JSON.stringify({ ...obj, date: formatDateToApi(obj.date) })
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      window.close()
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip == 2

  async function refetchForm(recordId) {
    if (recordId) {
      const res = await getRequest({
        extension: EmployeeRepository.JobInfo.get,
        parameters: `_recordId=${recordId}`
      })

      formik.setValues({ ...res.record, date: formatDateFromApi(res.record.date) })
    }
  }
  useEffect(() => {
    refetchForm(recordId)
  }, [])

  const onClose = async () => {
    await postRequest({
      extension: EmployeeRepository.JobInfo.close,
      record: JSON.stringify({ ...formik.values, date: formatDateToApi(formik.values.date) })
    })

    toast.success(platformLabels.Closed)
    refetchForm(recordId)
    invalidate()
  }

  const onReopen = async () => {
    await postRequest({
      extension: EmployeeRepository.JobInfo.reopen,
      record: JSON.stringify({ ...formik.values, date: formatDateToApi(formik.values.date) })
    })

    toast.success(platformLabels.Reopened)
    refetchForm(recordId)
    invalidate()
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
      disabled: !isClosed
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.JobInfos}
      functionId={SystemFunction.JobInfo}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.ref}
                value={formik.values.reference}
                maxAccess={maxAccess}
                readOnly={editMode}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
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
                displayFieldWidth={2}
                readOnly={isClosed}
                label={labels.employee}
                secondFieldLabel={labels.employee}
                form={formik}
                valueShow='employeeRef'
                secondValueShow='employeeName'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'fullName', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('employeeName', newValue?.fullName || '')
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                }}
                errorCheck={'employeeId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values?.date}
                readOnly={isClosed}
                required
                max={new Date()}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.DepartmentFilters.qry}
                parameters={`_filter=&_size=1000&_startAt=0&_type=0&_activeStatus=0&_sortBy=recordId`}
                name='departmentId'
                label={labels.department}
                values={formik.values}
                columnsInDropDown={[
                  { key: 'departmentRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                readOnly={isClosed}
                displayField={['departmentRef', 'name']}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('departmentId', newValue?.recordId || null)
                }}
                error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.BranchFilters.qry}
                name='branchId'
                label={labels.branch}
                columnsInDropDown={[
                  { key: 'branchRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['branchRef', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('branchId', newValue?.recordId || null)
                }}
                required
                readOnly={isClosed}
                error={formik.touched.branchId && Boolean(formik.errors.branchId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.DivisionFilters.qry}
                name='divisionId'
                label={labels.division}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                readOnly={isClosed}
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('divisionId', newValue?.recordId || null)
                }}
                error={formik.touched.divisionId && Boolean(formik.errors.divisionId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.CompanyPositions.qry}
                parameters='_filter=&_size=1000&_startAt=0&_sortBy=recordId'
                name='positionId'
                label={labels.position}
                required
                valueField='recordId'
                displayField={['positionRef', 'name']}
                columnsInDropDown={[
                  { key: 'positionRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                readOnly={isClosed}
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('positionId', newValue?.recordId || null)
                }}
                error={formik.touched.positionId && Boolean(formik.errors.positionId)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{ _branchId: 0 }}
                secondFieldLabel={labels.reportsTo}
                valueField='reference'
                displayField='fullName'
                name='reportToId'
                displayFieldWidth={2}
                label={labels.reportsTo}
                form={formik}
                readOnly={isClosed}
                valueShow='reportToRef'
                secondValueShow='reportToName'
                maxAccess={maxAccess}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'fullName', value: 'Name' }
                ]}
                onChange={(event, newValue) => {
                  formik.setFieldValue('reportToName', newValue?.fullName || '')
                  formik.setFieldValue('reportToId', newValue?.recordId || null)
                }}
                errorCheck={'reportToId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                rows={2}
                readOnly={isClosed}
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
