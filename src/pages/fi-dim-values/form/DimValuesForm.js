import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { ControlContext } from 'src/providers/ControlContext'

export default function DimValuesForm({ labels, maxAccess, dimensionId, id, invalidate }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: { id: id, name: '', dimension: dimensionId },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      id: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const id = formik.values.id

      const response = await postRequest({
        extension: FinancialRepository.DimensionValue.set,
        record: JSON.stringify(obj)
      })

      if (!id) {
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)
      formik.setValues({
        ...obj,
        id: obj.id
      })

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (dimensionId && id) {
          const res = await getRequest({
            extension: FinancialRepository.DimensionValue.get,
            parameters: `_Id=${formik.values.id}&_dimension=${dimensionId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.DimensionsValues} form={formik} maxAccess={maxAccess} infoVisible={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomNumberField
                name='id'
                label={labels.id}
                value={formik.values.id}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('id', '')}
                error={formik.touched.id && Boolean(formik.errors.id)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                rows={2}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
