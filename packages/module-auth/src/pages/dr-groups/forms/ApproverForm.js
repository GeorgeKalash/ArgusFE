import { useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const ApproverForm = ({ labels, maxAccess, record, store, invalidate }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId: groupId } = store

  const { formik } = useForm({
    initialValues: {
      codeId: record?.codeId || '',
      groupId
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      codeId: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: DocumentReleaseRepository.GroupCode.set,
        record: JSON.stringify(obj)
      })
      toast.success(!record?.codeId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (record?.codeId) {
        const res = await getRequest({
          extension: DocumentReleaseRepository.GroupCode.get,
          parameters: `_groupId=${groupId}&_codeId=${record.codeId}`
        })
        formik.setValues({
          codeId: res.record.codeId,
          groupId: res.record.groupId
        })
      }
    })()
  }, [record?.codeId])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
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
                readOnly={!!record?.codeId}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('codeId', newValue?.recordId)
                }}
                error={formik.touched.codeId && Boolean(formik.errors.codeId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default ApproverForm