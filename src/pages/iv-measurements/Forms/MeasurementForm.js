import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { useInvalidate } from 'src/hooks/resource'

export default function MeasurementForm({ labels, maxAccess, setStore, store }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const editMode = !!store.recordId

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Measurement.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: '',
      reference: '',
      name: '',
      type: 0,
      serialItems: false
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const response = await postRequest({
          extension: InventoryRepository.Measurement.set,
          record: JSON.stringify(obj)
        })

        if (!obj.recordId) {
          setStore(prevStore => ({
            ...prevStore,
            recordId: response.recordId
          }))
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', response.recordId)
        } else toast.success(platformLabels.Edited)

        invalidate()
      } catch (error) {}
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: InventoryRepository.Measurement.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell 
      resourceId={ResourceIds.Measurement} 
      form={formik} 
      maxAccess={maxAccess} 
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
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
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='serialItems'
                    maxAccess={maxAccess}
                    checked={formik.values?.serialItems}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.serialItem}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
