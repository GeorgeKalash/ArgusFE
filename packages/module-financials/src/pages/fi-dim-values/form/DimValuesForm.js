import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function DimValuesForm({ labels, maxAccess, recordId, dimValue }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const formatedRecordId = typeof dimValue == 'string' ? dimValue.match(/\d+/)?.[0] : null

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.DimensionValue.qry
  })

  const { formik } = useForm({
    initialValues: { id: null, name: '', dimension: formatedRecordId },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      id: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: FinancialRepository.DimensionValue.set,
        record: JSON.stringify(obj)
      })

      toast.success(!obj.id ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (formik.values.dimension && recordId) {
        const res = await getRequest({
          extension: FinancialRepository.DimensionValue.get,
          parameters: `_Id=${recordId}&_dimension=${formik.values.dimension}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.DimensionsValues} form={formik} maxAccess={maxAccess} isInfo={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
