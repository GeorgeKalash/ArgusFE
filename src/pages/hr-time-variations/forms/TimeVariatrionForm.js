import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import FormShell from 'src/components/Shared/FormShell'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useInvalidate } from 'src/hooks/resource'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import { TimeAttendanceRepository } from 'src/repositories/TimeAttendanceRepository'
import useResourceParams from 'src/hooks/useResourceParams'
import useSetWindow from 'src/hooks/useSetWindow'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { DataSets } from 'src/resources/DataSets'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { formatDateFromApi } from 'src/lib/date-helper'

export default function TimeVariatrionForm({ recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const TimeVariationDataSource = {
    GENERATED: 1,
    USER_ENTRY: 2
  }

  const { labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.TimeVariation,
    editMode: !!recordId
  })

  useSetWindow({ title: labels?.timeVariation, window })

  const invalidate = useInvalidate({
    endpointId: TimeAttendanceRepository.TimeVariation.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      reference: '',
      date: new Date(),
      employeeId: null,
      dataSource: TimeVariationDataSource.USER_ENTRY,
      timeCode: null,
      clockDuration: '',
      duration: '',
      damageLevel: null,
      justification: null,
      releaseStatus: null,
      wip: 1,
      status: 1
    },
    validationSchema: yup.object({
      employeeId: yup.number().required(),
      date: yup.date().required(),
      timeCode: yup.number().required(),
      damageLevel: yup.number().required()
    }),
    onSubmit: async values => {}
  })
  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2

  const actions = [
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
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

  async function onClose() {
    // const copy = { ...formik.values }
    // delete copy.items
    // copy.date = formatDateToApi(copy.date)
    // copy.dueDate = formatDateToApi(copy.dueDate)
    // const res = await postRequest({
    //   extension: SaleRepository.SalesOrder.close,
    //   record: JSON.stringify(copy)
    // })
    // toast.success(platformLabels.Closed)
    // invalidate()
    // await refetchForm(res.recordId)
  }

  async function onReopen() {
    // const copy = { ...formik.values }
    // delete copy.items
    // copy.date = formatDateToApi(copy.date)
    // copy.dueDate = formatDateToApi(copy.dueDate)
    // const res = await postRequest({
    //   extension: SaleRepository.SalesOrder.reopen,
    //   record: JSON.stringify(copy)
    // })
    // toast.success(platformLabels.Reopened)
    // invalidate()
    // await refetchForm(res.recordId)
  }
  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: TimeAttendanceRepository.TimeVariation.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues({ ...res.record, date: formatDateFromApi(res.record.date) })
      }
    })()
  }, [])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.TimeVariation}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels?.reference}
                value={formik.values?.reference}
                readOnly
                maxAccess={maxAccess}
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
                readOnly={isClosed}
                label={labels.employee}
                form={formik}
                displayFieldWidth={2}
                valueShow='employeeRef'
                secondValueShow='employeeName'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'fullName', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  formik.setFieldValue('employeeRef', newValue?.reference || '')
                  formik.setFieldValue('employeeName', newValue?.fullName || '')
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                }}
                errorCheck={'employeeId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik.values?.date}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
                readOnly={isClosed}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.TIME_CODE}
                name='timeCode'
                readOnly={isClosed}
                label={labels.timeCode}
                valueField='key'
                displayField='value'
                required
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('timeCode', newValue?.key || null)}
                error={formik.touched.timeCode && Boolean(formik.errors.timeCode)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='shiftId'
                endpointId={GeneralLedgerRepository.CostCenter.qry}
                parameters={`_params=&_startAt=0&_pageSize=1000`}
                label={labels.shift}
                valueField='recordId'
                displayField='dtRange'
                values={formik.values}
                readOnly={isClosed || formik.values?.clientId == 20 || formik.values?.timeCode == 20}
                onChange={(_, newValue) => {
                  formik.setFieldValue('shiftId', newValue?.recordId)
                }}
                error={formik.touched.shiftId && Boolean(formik.errors.shiftId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='clockDuration'
                label={labels?.clockDuration}
                value={formik.values?.clockDuration}
                readOnly
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('clockDuration', '')}
                error={formik.touched.clockDuration && Boolean(formik.errors.clockDuration)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='duration'
                label={labels.duration}
                value={formik.values.duration}
                maxAccess={maxAccess}
                readOnly={
                  isClosed ||
                  formik.values?.timeCode == 20 ||
                  formik.values?.timeCode == 21 ||
                  formik.values?.clientId == 20 ||
                  formik.values?.clientId == 21
                }
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('duration', null)}
                error={formik.touched.duration && Boolean(formik.errors.duration)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='damageLevel'
                label={labels.damage}
                datasetId={DataSets.DAMAGE_LEVEL}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('damageLevel', newValue?.key || null)}
                error={formik.touched.damageLevel && Boolean(formik.errors.damageLevel)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='justification'
                label={labels.justification}
                value={formik.values.justification}
                rows={2}
                readOnly={isClosed}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('justification', '')}
                error={formik.touched.justification && Boolean(formik.errors.justification)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

TimeVariatrionForm.width = 550
TimeVariatrionForm.height = 550
