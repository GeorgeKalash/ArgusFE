import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function PropertiesForm({ labels, maxAccess, dimNum, id, window, fetchData }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      id: id || null,
      dimension: dimNum,
      name: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      id: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: InventoryRepository.Dimension.set,
        record: JSON.stringify(obj)
      })

      toast.success(platformLabels.Updated)
      fetchData()
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
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
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
    </Form>
  )
}
