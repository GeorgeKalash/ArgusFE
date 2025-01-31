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

export default function DimValuesForm({ labels, maxAccess, id, dimValue }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const formatedRecordId = typeof dimValue == 'string' ? dimValue.match(/\d+/)?.[0] : null

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.DimensionValue.qry
  })

  const { formik } = useForm({
    initialValues: { id: id, name: '', dimension: formatedRecordId },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      id: yup.string().required()
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

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (formik.values.dimension && id) {
        const res = await getRequest({
          extension: FinancialRepository.DimensionValue.get,
          parameters: `_Id=${formik.values.id}&_dimension=${formik.values.dimension}`
        })

        formik.setValues(res.record)
      }
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
