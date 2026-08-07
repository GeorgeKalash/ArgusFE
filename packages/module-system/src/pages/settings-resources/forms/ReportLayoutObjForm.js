import { Grid } from '@mui/material'
import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'

const ReportLayoutObjForm = ({ labels, maxAccess, resourceId, record, onSuccess }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      id: record.id,
      resourceId,
      api: record.api,
      instanceName: record.instanceName,
      parameters: record.parameters,
      layoutName: record.layoutName,
      reportEngineName: record.reportEngineName,
      schemaFile: record.schemaFile,
      isInactive: record.isInactive ?? false,
      isConfidential: record.isConfidential ?? false,
      sgId: record.sgId ?? null
    },
    onSubmit: async values => {
      await postRequest({
        extension: SystemRepository.ReportLayoutObject.set,
        record: JSON.stringify(values)
      })

      toast.success(platformLabels.Updated)
      await onSuccess?.()
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomTextField
              name='api'
              label={labels.api}
              value={formik.values.api}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='instanceName'
              label={labels.instanceName}
              value={formik.values.instanceName}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='parameters'
              label={labels.params}
              value={formik.values.parameters}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='layoutName'
              label={labels.layoutName}
              value={formik.values.layoutName}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='reportEngineName'
              label={labels.reportEngineName}
              value={formik.values.reportEngineName}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='schemaFile'
              label={labels.schemaFile}
              value={formik.values.schemaFile}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomCheckBox
              name='isInactive'
              label={labels.isInactive}
              checked={formik.values.isInactive}
              onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomCheckBox
              name='isConfidential'
              label={labels.isConfidential}
              checked={formik.values.isConfidential}
              onChange={event => formik.setFieldValue('isConfidential', event.target.checked)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={AccessControlRepository.SecurityGroup.qry}
              parameters={`_startAt=0&_pageSize=1000`}
              name='sgId'
              label={labels.securityGrp}
              values={formik.values}
              valueField='recordId'
              displayField='name'
              maxAccess={maxAccess}
              onChange={(_, newValue) => {
                formik.setFieldValue('sgId', newValue?.recordId || null)
              }}
              error={formik.touched.sgId && Boolean(formik.errors.sgId)}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </Form>
  )
}

export default ReportLayoutObjForm