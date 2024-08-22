import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'

export default function SalaryRangeForm({ labels, maxAccess, recordId }) {
  const [editMode, setEditMode] = useState(!!recordId)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.SalaryRange.page
  })

  const { formik } = useForm({
    initialValues: { recordId: null, min: '', max: '' },
    enableReinitialize: true,
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      min: yup
        .string()
        .required(' ')
        .test('minValue', 'Minimum value is 1', value => {
          return value > 0
        }),
      max: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      try {
        const recordId = obj.recordId

        const response = await postRequest({
          extension: RemittanceSettingsRepository.SalaryRange.set,
          record: JSON.stringify(obj)
        })

        if (!recordId) {
          toast.success('Record Added Successfully')
          formik.setValues({
            ...obj,
            recordId: response.recordId
          })
        } else toast.success('Record Edited Successfully')
        setEditMode(true)
        invalidate()
      } catch (exception) {}
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: RemittanceSettingsRepository.SalaryRange.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.SalaryRange} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4} style={{ marginTop: '0.1rem' }}>
            <Grid item xs={12}>
              <CustomTextField
                name='min'
                label={labels.min}
                value={formik.values.min}
                required
                maxLength='10'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('min', '')}
                error={formik.touched.min && Boolean(formik.errors.min)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='max'
                label={labels.max}
                value={formik.values.max}
                required
                maxLength='10'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('max', '')}
                error={formik.touched.max && Boolean(formik.errors.max)}
              />
            </Grid>
          </Grid>
        </Grow>{' '}
      </VertLayout>
    </FormShell>
  )
}
