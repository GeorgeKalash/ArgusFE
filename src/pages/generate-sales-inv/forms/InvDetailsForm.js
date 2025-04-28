import { Grid } from '@mui/material'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'

export default function InvDetailsForm({ labels, access, form, window }) {
  const { formik } = useForm({
    initialValues: {
      date: form?.values?.date || new Date(),
      plantId: form?.values?.plantId || null,
      description: form?.values?.description || ''
    },
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required()
    }),
    onSubmit: async obj => {
      form.setValues({
        ...form.values,
        date: obj.date,
        plantId: obj.plantId,
        description: obj.description
      })

      window.close()
    }
  })

  return (
    <FormShell
      resourceId={ResourceIds.GenerateInvoices}
      form={formik}
      maxAccess={access}
      isCleared={false}
      isInfo={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                label={labels.date}
                value={formik?.values?.date}
                onChange={formik.setFieldValue}
                maxAccess={access}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || null)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='description'
                label={labels.description}
                value={formik.values.description}
                rows={2}
                maxAccess={access}
                onChange={e => formik.setFieldValue('description', e.target.value)}
                onClear={() => formik.setFieldValue('description', '')}
                error={formik.touched.description && Boolean(formik.errors.description)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
