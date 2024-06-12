import { Grid } from '@mui/material'
import { useContext } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { useForm } from 'src/hooks/form.js'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

export default function ResourceGlobalForm({ labels, maxAccess, row, invalidate, window }) {
  const { postRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      ...row
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      accessLevel: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        await postRequest({
          extension: AccessControlRepository.ModuleClass.set,
          record: JSON.stringify(obj)
        })

        toast.success('Record Edited Successfully')
        invalidate()
        window.close()
      } catch (error) {}
    }
  })

  return (
    <FormShell
      resourceId={ResourceIds.SecurityGroup}
      form={formik}
      maxAccess={maxAccess}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='resourceId'
                label={labels.resourceId}
                value={formik.values.resourceId}
                required
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                readOnly={true}
                onClear={() => formik.setFieldValue('resourceId', '')}
                error={formik.touched.resourceId && Boolean(formik.errors.resourceId)}
                helperText={formik.touched.resourceId && formik.errors.resourceId}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='resourceName'
                label={labels.resourceName}
                value={formik.values.resourceName}
                required
                readOnly={true}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('resourceName', '')}
                error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
                helperText={formik.touched.resourceName && formik.errors.resourceName}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.ACCESS_LEVEL}
                name='accessLevel'
                label={labels.accessLevel}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('accessLevel', newValue?.key || '')
                }}
                error={formik.touched.accessLevel && Boolean(formik.errors.accessLevel)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
