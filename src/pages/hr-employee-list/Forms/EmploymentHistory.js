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

const EmploymentHistory = ({ recordId, labels, maxAccess, editMode }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      status: null,
      date: null,
      comment: null
    },
    validationSchema: yup.object({
      status: yup.string().required(),
      date: yup.date().required()
    }),
    onSubmit: async values => {}
  })

  const getData = async recordId => {
    const res = await getRequest({
      extension: BusinessPartnerRepository.Relation.get,
      parameters: `_recordId=${recordId}`
    })

    res.record.date = formatDateFromApi(res.record.date)
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
      infoVisible={false}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={BusinessPartnerRepository.RelationTypes.qry}
                name='status'
                label={labels.status}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('status', newValue?.recordId || null)
                }}
                error={formik.touched.status && Boolean(formik.errors.status)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
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
