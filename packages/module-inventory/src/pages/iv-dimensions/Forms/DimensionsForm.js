import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

export default function DimensionsForm({ labels, maxAccess, id }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Dimensions.page
  })

  const { formik } = useForm({
    initialValues: {
      id: null,
      name: ''
    },
    validationSchema: yup.object({
      name: yup.string().required(),
      id: yup.number().min(1).max(999).required(),
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: InventoryRepository.Dimensions.set,
        record: JSON.stringify(obj)
      })

      toast.success(!formik.values.recordId ? platformLabels.Added : platformLabels.Edited)
      formik.setFieldValue('recordId', obj.id)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (id) {
        const res = await getRequest({
          extension: InventoryRepository.Dimensions.get,
          parameters: `_id=${id}`
        })

        formik.setValues({
            ...res.record,
            recordId: res.record.id
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Dimensions} form={formik} maxAccess={maxAccess} editMode={editMode} isCleared={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomNumberField
                name='id'
                label={labels.id}
                value={formik.values.id}
                onChange={formik.handleChange}
                maxLength='3'
                required
                decimalScale={0}
                readOnly={editMode}
                onClear={() => formik.setFieldValue('id', null)}
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
                maxLength='50'
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
