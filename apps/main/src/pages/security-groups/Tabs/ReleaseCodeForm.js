import { Grid } from '@mui/material'
import { useContext } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function ReleaseCodeForm({ labels, maxAccess, recordId, window }) {
  const { postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: AccessControlRepository.SGReleaseCode.qry
  })

  const { formik } = useForm({
    initialValues: {
      sgId: recordId,
      codeId: null
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      codeId: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: AccessControlRepository.SGReleaseCode.set,
        record: JSON.stringify(obj)
      })
      toast.success('Record Added Successfully')
      invalidate()
      window.close()
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={!!recordId}>
      <VertLayout>
        <Grow>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={DocumentReleaseRepository.ReleaseCode.qry}
              parameters='_startAt=0&_pageSize=1000'
              name='codeId'
              label={labels.code}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
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
