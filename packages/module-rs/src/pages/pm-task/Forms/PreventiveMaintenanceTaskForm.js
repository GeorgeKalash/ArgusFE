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
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { RepairAndServiceRepository } from '@argus/repositories/src/repositories/RepairAndServiceRepository'

export default function PreventiveMaintenanceTaskForm({ labels, maxAccess, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.PreventiveMaintenanceTasks.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      name: ''
    },
    validationSchema: yup.object({
      name: yup.string().min(3, 'Name must be at least 3 characters').required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: RepairAndServiceRepository.PreventiveMaintenanceTasks.set,
        record: JSON.stringify(obj)
      })

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      if (!obj.recordId) formik.setFieldValue('recordId', response.recordId)
      invalidate()
      window.close()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.PreventiveMaintenanceTasks.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res?.record)
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.PreventiveMaintenanceTasks}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='30'
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
