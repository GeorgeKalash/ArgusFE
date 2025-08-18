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
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'

export default function ReplineshmentForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: IVReplenishementRepository.ReplenishmentGroups.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      reference: '',
      name: '',
      defaultMaxQty: '',
      defaultMinQty: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      defaultMinQty: yup
        .number()
        .nullable()
        .min(0, 'Must be greater than or equal to 0')
        .max(1000)
        .test('lessThanMax', 'minUnitPrice must be less than or equal to defaultMaxQty', function (value) {
          const { defaultMaxQty } = this.parent

          return (
            defaultMaxQty === undefined ||
            defaultMaxQty === null ||
            value === undefined ||
            value === null ||
            value <= defaultMaxQty
          )
        }),
      defaultMaxQty: yup
        .number()
        .nullable()
        .max(1000, 'Must be less than or equal to 1000')
        .test('greaterThanMin', 'defaultMaxQty must be greater than or equal to defaultMinQty', function (value) {
          const { defaultMinQty } = this.parent

          return (
            defaultMinQty === undefined ||
            defaultMinQty === null ||
            value === undefined ||
            value === null ||
            value >= defaultMinQty
          )
        }),
      defaultRequiredQty: yup
        .number()
        .nullable()
        .min(0, 'Must be greater than or equal to 0')
        .max(1000, 'Must be less than or equal to 1000')
    }),

    onSubmit: async obj => {
      const response = await postRequest({
        extension: IVReplenishementRepository.ReplenishmentGroups.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId
  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: IVReplenishementRepository.ReplenishmentGroups.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.IRReplenishmentGrps} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                required
                value={formik.values.reference}
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
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
                name='defaultMaxQty'
                label={labels.defaultMaxQty}
                value={formik.values.defaultMaxQty}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('defaultMaxQty', '')}
                allowNegative={false}
                error={formik.touched.defaultMaxQty && Boolean(formik.errors.defaultMaxQty)}
                helperText={formik.touched.defaultMaxQty && formik.errors.defaultMaxQty}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='defaultMinQty'
                label={labels.defaultMinQty}
                value={formik.values.defaultMinQty}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('defaultMinQty', '')}
                allowNegative={false}
                error={formik.touched.defaultMinQty && Boolean(formik.errors.defaultMinQty)}
                helperText={formik.touched.defaultMinQty && formik.errors.defaultMinQty}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='defaultRequiredQty'
                label={labels.defaultRequiredQty}
                value={formik.values.defaultRequiredQty}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('defaultRequiredQty', '')}
                allowNegative={false}
                error={formik.touched.defaultRequiredQty && Boolean(formik.errors.defaultRequiredQty)}
                helperText={formik.touched.defaultRequiredQty && formik.errors.defaultRequiredQty}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
