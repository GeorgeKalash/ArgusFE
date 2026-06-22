import { useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const ApproverForm = ({ labels, maxAccess, codeId, store, window }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId: groupId } = store

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.GroupCode.qry
  })

  const { formik } = useForm({
    initialValues: {
      codeId,
      groupId
    },
    maxAccess,
    validationSchema: yup.object({
      codeId: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: DocumentReleaseRepository.GroupCode.set,
        record: JSON.stringify(obj)
      })
      toast.success(!codeId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
      window.close()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (codeId) {
        const res = await getRequest({
          extension: DocumentReleaseRepository.GroupCode.get,
          parameters: `_groupId=${groupId}&_codeId=${codeId}`
        })
        formik.setValues(res?.record || {})
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={DocumentReleaseRepository.ReleaseCode.qry}
              parameters={`_startAt=0&_pageSize=100`}
              name='codeId'
              label={labels.code}
              valueField='recordId'
              displayField='name'
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              required
              maxAccess={maxAccess}
              onChange={(_, newValue) => {
                formik.setFieldValue('codeId', newValue?.recordId || null)
              }}
              error={formik.touched.codeId && Boolean(formik.errors.codeId)}
            />
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default ApproverForm