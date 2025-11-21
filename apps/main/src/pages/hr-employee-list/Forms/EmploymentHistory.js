import { Grid } from '@mui/material'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import toast from 'react-hot-toast'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import * as yup from 'yup'
import { formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const EmploymentHistory = ({ recordId, labels, maxAccess, employeeId, window }) => {
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
      await postRequest({
        extension: EmployeeRepository.EmployementHistory.set,
        record: JSON.stringify({
          ...values,
          employeeId
        })
      })

      toast.success(values.recordId ? platformLabels.Edited : platformLabels.Added)

      window.close()
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

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
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode}>
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
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='comment'
                label={labels.comments}
                value={formik?.values?.comment}
                maxLength='100'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('comment', '')}
                error={formik.touched.comment && Boolean(formik.errors.comment)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default EmploymentHistory
