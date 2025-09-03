import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { PayrollRepository } from 'src/repositories/PayrollRepository'

export default function PayCodesForm({ labels, data, maxAccess, window }) {
  const { platformLabels } = useContext(ControlContext)
  const { postRequest } = useContext(RequestsContext)

  const editMode = !!data

  const invalidate = useInvalidate({
    endpointId: PayrollRepository.Paycode.qry
  })

  const { formik } = useForm({
    initialValues: {
      name: '',
      payCode: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      payCode: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: PayrollRepository.Paycode.set,
        record: JSON.stringify(obj)
      })

      toast.success(!data ? platformLabels.Added : platformLabels.Edited)
      invalidate()
      window.close()
    }
  })

  useEffect(() => {
    if (data) {
      console.log(data)
      formik.setValues({ ...data })
    }
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.PayCode}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='payCode'
                label={labels.PayCode}
                value={formik.values.payCode}
                readOnly={editMode}
                maxLength='10'
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('payCode', '')}
                error={formik.touched.payCode && formik.errors.payCode}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                maxLength='30'
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && formik.errors.name}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
