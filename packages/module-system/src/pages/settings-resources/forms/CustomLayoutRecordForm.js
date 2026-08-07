import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'

const CustomLayoutRecordForm = ({ labels, maxAccess, resourceId, recordId, onSuccess, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      id: recordId || 0,
      resourceId,
      reportEngine: null,
      wsName: '',
      reportName: '',
      assembly: '',
      parameters: '',
      caption: '',
      schemaFile: '',
      isInactive: false,
      isConfidential: false,
      sgId: null
    },
    validationSchema: yup.object({
      reportEngine: yup.number().required(),
      wsName: yup.string().required(),
      reportName: yup.string().required(),
      caption: yup.string().required(),
      assembly: yup.string().when('reportEngine', {
        is: 1,
        then: () => yup.string().required(),
        otherwise: () => yup.string().nullable()
      }),
      schemaFile: yup.string().when('reportEngine', {
        is: 2,
        then: () => yup.string().required(),
        otherwise: () => yup.string().nullable()
      })
    }),
    onSubmit: async values => {
      await postRequest({
        extension: SystemRepository.ReportTemplate.set, 
        record: JSON.stringify(values)
      })

      toast.success(!recordId ? platformLabels.Added : platformLabels.Edited)
      onSuccess?.()
      window.close()
    }
  })

  useEffect(() => {
    if (recordId) {
      getRequest({
        extension: SystemRepository.ReportTemplate.get,
        parameters: `_resourceId=${resourceId}&_id=${recordId}`
      }).then(res => {
        formik.setValues({ ...formik.values, ...res.record })
      })
    }
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.REPORT_ENGINE}
              name='reportEngine'
              label={labels.reportEngineName}
              valueField='key'
              displayField='value'
              required
              values={formik.values}
              onChange={(_, newValue) => {
                formik.setFieldValue('assembly', '')
                formik.setFieldValue('schemaFile', '')
                formik.setFieldValue('reportEngine', newValue?.key || null)
              }}
              maxAccess={maxAccess}
              error={formik.touched.reportEngine && Boolean(formik.errors.reportEngine)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='wsName'
              label={labels.api}
              value={formik.values.wsName}
              required
              maxLength={100}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('wsName', '')}
              error={formik.touched.wsName && Boolean(formik.errors.wsName)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='reportName'
              label={labels.instanceName}
              value={formik.values.reportName}
              required
              maxLength={50}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('reportName', '')}
              error={formik.touched.reportName && Boolean(formik.errors.reportName)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='assembly'
              label={labels.assembly}
              value={formik.values.assembly}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('assembly', '')}
              readOnly={formik.values.reportEngine != 1}
              required={formik.values.reportEngine == 1}
              maxAccess={maxAccess}
              maxLength={50}
              error={formik.touched.assembly && Boolean(formik.errors.assembly)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='parameters'
              label={labels.params}
              value={formik.values.parameters}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('parameters', '')}
              maxAccess={maxAccess}
              maxLength={10}
              error={formik.touched.parameters && Boolean(formik.errors.parameters)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='caption'
              label={labels.layoutName}
              value={formik.values.caption}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('caption', '')}
              maxAccess={maxAccess}
              required
              maxLength={40}
              error={formik.touched.caption && Boolean(formik.errors.caption)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='schemaFile'
              label={labels.schemaFile}
              value={formik.values.schemaFile}
              onChange={formik.handleChange}
              readOnly={formik.values.reportEngine != 2}
              required={formik.values.reportEngine == 2}
              maxAccess={maxAccess}
              maxLength={50}
              onClear={() => formik.setFieldValue('schemaFile', '')}
              error={formik.touched.schemaFile && Boolean(formik.errors.schemaFile)}
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

export default CustomLayoutRecordForm