import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { useInvalidate } from '@argus/shared-hooks/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/hooks/form'
import { VertLayout } from '@argus/shared-ui/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/providers/ControlContext'
import { RepairAndServiceRepository } from '@argus/repositories/repositories/RepairAndServiceRepository'
import CustomTextArea from '@argus/shared-ui/components/Inputs/CustomTextArea'

export default function JobPositionForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.JobPosition.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      reference: '',
      name: '',
      jobDescription: ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: RepairAndServiceRepository.JobPosition.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) formik.setFieldValue('recordId', response.recordId)
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.JobPosition.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.JobPosition} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                maxLength='10'
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
                maxLength='30'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='jobDescription'
                label={labels.jobDescription}
                value={formik.values.jobDescription}
                maxLength='500'
                rows={3}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('jobDescription', '')}
                error={formik.touched.jobDescription && Boolean(formik.errors.jobDescription)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
