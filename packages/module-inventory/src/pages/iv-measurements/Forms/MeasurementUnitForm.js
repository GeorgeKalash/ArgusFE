import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function MeasurementUnitForm({
  msId,
  recordId,
  labels,
  maxAccess,
  getMeasurementUnitGridData,
  window,
  store
}) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const editMode = !!store.recordId

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      msId,
      reference: '',
      name: '',
      qty: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required(),
      qty: yup.number().required().min(0.00001)
    }),
    onSubmit: async obj => {
      const data = {
        msId,
        recordId,
        ...obj
      }

      const response = await postRequest({
        extension: InventoryRepository.MeasurementUnit.set,
        record: JSON.stringify(data)
      })

      !recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)

      formik.setFieldValue('recordId', response.recordId)

      await getMeasurementUnitGridData(msId)
      window.close()
    }
  })

  const getMeasurementUnitById = async recordId => {
    const res = await getRequest({
      extension: InventoryRepository.MeasurementUnit.get,
      parameters: `_recordId=${recordId}`
    })

    formik.setValues(res.record)
  }

  useEffect(() => {
    if (recordId) {
      getMeasurementUnitById(recordId)
    }
  }, [recordId])

  return (
    <FormShell
      resourceId={ResourceIds.Measurement}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isInfo={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik?.values?.reference}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik?.values?.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='qty'
                required
                label={labels.qty}
                value={formik?.values?.qty}
                allowNegative={false}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('qty', '')}
                error={formik.touched.qty && Boolean(formik.errors.qty)}
                decimalScale={store.decimals}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
