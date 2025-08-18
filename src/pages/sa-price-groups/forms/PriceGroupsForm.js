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

export default function PriceGroupsForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.PriceGroups.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      reference: '',
      name: '',
      minUnitPrice: '',
      maxUnitPrice: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      minUnitPrice: yup
        .number()
        .nullable()
        .min(0, 'Must be greater than or equal to 0')
        .test('lessThanMax', 'minUnitPrice must be less than or equal to maxUnitPrice', function (value) {
          const { maxUnitPrice } = this.parent

          return (
            maxUnitPrice === undefined ||
            maxUnitPrice === null ||
            value === undefined ||
            value === null ||
            value <= maxUnitPrice
          )
        }),
      maxUnitPrice: yup
        .number()
        .nullable()
        .test('greaterThanMin', 'maxUnitPrice must be greater than or equal to minUnitPrice', function (value) {
          const { minUnitPrice } = this.parent

          return (
            minUnitPrice === undefined ||
            minUnitPrice === null ||
            value === undefined ||
            value === null ||
            value >= minUnitPrice
          )
        })
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SaleRepository.PriceGroups.set,
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
          extension: SaleRepository.PriceGroups.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.PriceGroups} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                required
                label={labels.reference}
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
                name='minUnitPrice'
                label={labels.minUnitPrice}
                value={formik.values.minUnitPrice}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('minUnitPrice', '')}
                error={formik.touched.minUnitPrice && Boolean(formik.errors.minUnitPrice)}
                allowNegative={false}
                decimalScale={3}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='maxUnitPrice'
                label={labels.maxUnitPrice}
                value={formik.values.maxUnitPrice}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('maxUnitPrice', '')}
                error={formik.touched.maxUnitPrice && Boolean(formik.errors.maxUnitPrice)}
                allowNegative={false}
                decimalScale={3}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
