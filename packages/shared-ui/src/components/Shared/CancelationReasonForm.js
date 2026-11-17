import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'

const CancelReasonForm = ({ action, functionId, recordId, isCancelled = false, window }) => {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest } = useContext(RequestsContext)

  useSetWindow({ title: platformLabels.CancelReason, window })

  const { access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.CancelReason
  })

  const { formik } = useForm({
    initialValues: {
      cancelReason: ''
    },
    validationSchema: yup.object({
      cancelReason: yup.string().max(200)
    }),
    onSubmit: async values => {
      await action?.(values.cancelReason?.trim() || '')
      window.close()
    }
  })

  useEffect(() => {
    if (!(isCancelled && functionId && recordId)) return
    ;(async () => {
      const res = await getRequest({
        extension: SystemRepository.ActivityCancellationReason.get,
        parameters: `_functionId=${functionId}&_recordId=${recordId}`
      })

      formik.setFieldValue('cancelReason', res?.record?.notes || '')
    })()
  }, [])

  const actions = [
    {
      key: 'Cancel',
      condition: true,
      onClick: formik.handleSubmit,
      disabled: isCancelled
    }
  ]

  return (
    <Form
      onSave={formik.handleSubmit}
      maxAccess={maxAccess}
      editMode={false}
      isSaved={false}
      actions={actions}
      disabledSubmit={isCancelled}
    >
      <VertLayout>
        <Grow>
          <Grid container>
            <Grid item xs={12}>
              <CustomTextArea
                name='cancelReason'
                label={platformLabels.CancelReason}
                value={formik.values.cancelReason}
                rows={5}
                maxLength={200}
                readOnly={isCancelled}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('cancelReason', e.target.value)}
                onClear={() => formik.setFieldValue('cancelReason', '')}
                error={formik.touched.cancelReason && Boolean(formik.errors.cancelReason)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

CancelReasonForm.width = 500
CancelReasonForm.height = 300

export default CancelReasonForm