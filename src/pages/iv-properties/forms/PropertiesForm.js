import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ControlContext } from 'src/providers/ControlContext'

export default function PropertiesForm({ labels, maxAccess, dimNum, id, window, invalidate }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      id: id || null,
      dimension: dimNum,
      name: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      id: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: InventoryRepository.Dimension.set,
        record: JSON.stringify(obj)
      })
      if (!obj?.id) {
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)

      invalidate()
      window.close()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (id) {
        const res = await getRequest({
          extension: InventoryRepository.Dimension.get,
          parameters: `_dimension=${dimNum}&_id=${id}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [id])

  return (
    <FormShell
      resourceId={ResourceIds.IVDimension}
      form={formik}
      maxAccess={maxAccess}
      infoVisible={false}
      isCleared={false}
    >
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
                maxLength='30'
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
