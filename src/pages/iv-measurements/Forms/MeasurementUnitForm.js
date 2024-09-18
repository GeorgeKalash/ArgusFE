import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function MeasurementUnitForm({ msId, recordId, labels, maxAccess, getMeasurementUnitGridData, window, store }) {
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
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required(),
      qty: yup.number().required()
    }),
    onSubmit: async obj => {
      try {
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
      } catch (error) {}
    }
  })

  const getMeasurementUnitById = async recordId => {
    try {
      const res = await getRequest({
        extension: InventoryRepository.MeasurementUnit.get,
        parameters: `_recordId=${recordId}`
      })

      formik.setValues(res.record)
    } catch (error) {}
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
          <Grid container spacing={4}>
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
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('qty', '')}
                error={formik.touched.qty && Boolean(formik.errors.qty)}
                decimalScale={3}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
