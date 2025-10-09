import { Grid } from '@mui/material'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import toast from 'react-hot-toast'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import * as yup from 'yup'
import { formatDateFromApi } from 'src/lib/date-helper'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { useInvalidate } from 'src/hooks/resource'

const EmploymentHistory = ({ recordId, labels, maxAccess, editMode, employeeId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.EmployementHistory.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      employeeId,
      statusId: null,
      date: new Date(),
      comment: ''
    },
    validationSchema: yup.object({
      statusId: yup.number().required(),
      date: yup.date().required()
    }),
    onSubmit: async values => {
      const response = await postRequest({
        extension: EmployeeRepository.EmployementHistory.set,
        record: JSON.stringify({
          ...values,
          employeeId
        })
      })

      toast.success(values.recordId ? platformLabels.Edited : platformLabels.Added)
      formik.setFieldValue('recordId', response.recordId)
      invalidate()
    }
  })

  const getData = async recordId => {
    const res = await getRequest({
      extension: EmployeeRepository.EmployementHistory.get,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues({
      ...res.record,
      date: formatDateFromApi(res.record.date)
    })
  }

  useEffect(() => {
    if (recordId) getData(recordId)
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.EmployeeFilter}
      form={formik}
      maxAccess={maxAccess}
      isInfo={false}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={EmployeeRepository.EmploymentStatusFilters.qry}
                name='statusId'
                label={labels.status}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                required
                onChange={(_, newValue) => {
                  formik.setFieldValue('statusId', newValue?.recordId || null)
                }}
                error={formik.touched.statusId && Boolean(formik.errors.statusId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                required
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='comment'
                label={labels.comment}
                value={formik?.values?.comment}
                maxLength='200'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('comment', '')}
                error={formik.touched.comment && Boolean(formik.errors.comment)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default EmploymentHistory
