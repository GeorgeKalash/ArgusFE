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
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const SkillsForm = ({ recordId, employeeId, labels, maxAccess, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: EmployeeRepository.Skills.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      employeeId,
      institution: '',
      clId: null,
      dateFrom: null,
      dateTo: null,
      remarks: '',
      grade: '',
      major: ''
    },
    validationSchema: yup.object({
      institution: yup.string().required(),
      clId: yup.number().required(),
      grade: yup.string().required(),
      major: yup.string().required()
    }),
    onSubmit: async values => {
      await postRequest({
        extension: EmployeeRepository.Skills.set,
        record: JSON.stringify({
          ...values,
          employeeId
        })
      })

      toast.success(values.recordId ? platformLabels.Edited : platformLabels.Added)

      invalidate()
      window.close()
    }
  })

  const editMode = !!recordId

  const getData = async recordId => {
    const res = await getRequest({
      extension: EmployeeRepository.Skills.get,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues({
      ...res.record,
      dateFrom: formatDateFromApi(res.record.dateFrom),
      dateTo: formatDateFromApi(res.record.dateTo),
      employeeId
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
              <CustomTextField
                name='institution'
                label={labels.institution}
                value={formik.values.institution}
                required
                maxLength={50}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('institution', '')}
                error={formik.touched.institution && Boolean(formik.errors.institution)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={EmployeeRepository.CertificateFilters.qry}
                name='clId'
                label={labels.level}
                valueField='recordId'
                maxAccess={maxAccess}
                required
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('clId', newValue?.recordId || null)
                }}
                error={formik.touched.clId && Boolean(formik.errors.clId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='dateFrom'
                label={labels.from}
                value={formik.values?.dateFrom}
                maxAccess={maxAccess}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('dateFrom', null)}
                error={formik.touched.dateFrom && Boolean(formik.errors.dateFrom)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='dateTo'
                label={labels.to}
                value={formik.values?.dateTo}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('dateTo', null)}
                error={formik.touched.dateTo && Boolean(formik.errors.dateTo)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='remarks'
                label={labels.remarks}
                value={formik?.values?.remarks}
                maxLength='100'
                rows={2}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('remarks', '')}
                error={formik.touched.remarks && Boolean(formik.errors.remarks)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='grade'
                label={labels.grade}
                value={formik.values.grade}
                required
                maxAccess={maxAccess}
                maxLength={20}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('grade', '')}
                error={formik.touched.grade && Boolean(formik.errors.grade)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='major'
                label={labels.major}
                value={formik.values.major}
                required
                maxLength={50}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('major', '')}
                error={formik.touched.major && Boolean(formik.errors.major)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default SkillsForm
