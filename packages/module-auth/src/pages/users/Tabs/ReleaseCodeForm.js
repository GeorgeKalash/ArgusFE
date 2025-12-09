import { Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const ReleaseCodeForm = ({ labels, maxAccess, storeRecordId, invalidate, window }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: {
      userId: storeRecordId,
      codeId: null
    },
    validationSchema: yup.object({
      codeId: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        await postRequest({
          extension: AccessControlRepository.UserReleaseCode.set,
          record: JSON.stringify(obj)
        })
        toast.success(platformLabels.Updated)
        window.close()
        invalidate()
      } catch (error) {}
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={!!storeRecordId}>
      <VertLayout>
        <Grow>
          <Grid item xs={6}>
            <ResourceComboBox
              endpointId={DocumentReleaseRepository.ReleaseCode.qry}
              parameters={`_filter=&_startAt=${0}&_pageSize=${1000}`}
              name='codeId'
              label={labels.code}
              valueField='recordId'
              displayField='name'
              required
              values={formik.values}
              onChange={async (event, newValue) => {
                formik.setFieldValue('codeId', newValue ? newValue.recordId : null)
              }}
              error={formik.touched.codeId && Boolean(formik.errors.codeId)}
              maxAccess={maxAccess}
            />
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default ReleaseCodeForm
