import { Grid } from '@mui/material'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
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
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { DataSets } from 'src/resources/DataSets'

const SkillsForm = ({ recordId, labels, maxAccess, editMode }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
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
      clId: yup.date().required(),
      grade: yup.string().required(),
      major: yup.string().required()
    }),
    onSubmit: async values => {}
  })

  const getData = async recordId => {
    const res = await getRequest({
      extension: BusinessPartnerRepository.Relation.get,
      parameters: `_recordId=${recordId}`
    })

    res.record.dateFrom = formatDateFromApi(res.record.dateFrom)
    res.record.dateTo = formatDateFromApi(res.record.dateTo)
    formik.setValues(res.record)
  }

  useEffect(() => {
    recordId && getData(recordId)
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.EmployeeFilter}
      form={formik}
      maxAccess={maxAccess}
      isInfo={false}
      editMode={editMode}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='institution'
                label={labels.institution}
                value={formik.values.institution}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('institution', '')}
                error={formik.touched.institution && Boolean(formik.errors.institution)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='clId'
                label={labels.level}
                datasetId={DataSets.FI_GROUP_TYPE} // Different KVS
                required
                values={formik.values}
                valueField='key'
                displayField='value'
                onChange={(event, newValue) => {
                  formik.setFieldValue('clId', newValue?.key || null)
                }}
                error={formik.touched.clId && Boolean(formik.errors.clId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='dateFrom'
                label={labels.from}
                value={formik.values?.dateFrom}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('dateFrom', '')}
                error={formik.touched.dateFrom && Boolean(formik.errors.dateFrom)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='dateTo'
                label={labels.to}
                value={formik.values?.dateTo}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('dateTo', '')}
                error={formik.touched.dateTo && Boolean(formik.errors.dateTo)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='remarks'
                label={labels.remarks}
                value={formik?.values?.remarks}
                maxLength='200'
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
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('major', '')}
                error={formik.touched.major && Boolean(formik.errors.major)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SkillsForm
