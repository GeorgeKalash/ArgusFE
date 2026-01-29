import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'

export default function SalaryRangeForm({ labels, maxAccess, recordId }) {
  const [editMode, setEditMode] = useState(!!recordId)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.SalaryRange.page
  })

  const { formik } = useForm({
    initialValues: { recordId: null, min: '', max: '' },
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
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RemittanceSettingsRepository.SalaryRange.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.SalaryRange} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2} style={{ marginTop: '0.1rem' }}>
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
