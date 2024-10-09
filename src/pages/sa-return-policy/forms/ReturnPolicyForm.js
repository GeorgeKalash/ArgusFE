import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function ReturnPolicyForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.ReturnPolicy.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      name: '',
      maxPct: '',
      maxDaysBack: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      maxPct: yup
        .number()
        .required()
        .min(0.01, ' must be greater than 0')
        .max(100, ' must be less than or equal to 100')
    }),
    onSubmit: async obj => {
      try {
        const response = await postRequest({
          extension: SaleRepository.ReturnPolicy.set,
          record: JSON.stringify(obj)
        })

        if (!obj.recordId) {
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', response.recordId)
        } else toast.success(platformLabels.Edited)

        invalidate()
      } catch (error) {}
    }
  })
  const editMode = !!formik.values.recordId
  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: SaleRepository.ReturnPolicy.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.ReturnPolicy} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='maxPct'
                required
                label={labels.maxPt}
                value={formik.values.maxPct}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('maxPct', '')}
                error={formik.touched.maxPct && Boolean(formik.errors.maxPct)}
                allowNegative={false}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='maxDaysBack'
                label={labels.maxDaysBack}
                value={formik.values.maxDaysBack}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('maxDaysBack', '')}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
