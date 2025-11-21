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
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'

export default function NotificationLabelsForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: AccessControlRepository.NotificationLabel.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      label: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      label: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: AccessControlRepository.NotificationLabel.set,
        record: JSON.stringify(obj)
      })

      !obj.recordId ? toast.success(platformLabels.Added) : toast.success(platformLabels.Edited)
      formik.setFieldValue('recordId', response.recordId)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: AccessControlRepository.NotificationLabel.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.NotificationLabels} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='label'
                label={labels.label}
                value={formik.values.label}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('label', '')}
                error={formik.touched.label && Boolean(formik.errors.label)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
