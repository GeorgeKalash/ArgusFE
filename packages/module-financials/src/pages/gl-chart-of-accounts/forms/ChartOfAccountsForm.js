import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { GeneralLedgerRepository } from '@argus/repositories/src/repositories/GeneralLedgerRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import SegmentedInput from '@argus/shared-ui/src/components/Inputs/SegmentedInput'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function ChartOfAccountsForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: GeneralLedgerRepository.ChartOfAccounts.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId,
      accountRef: '',
      name: '',
      description: '',
      groupId: null,
      disableManualEntry: false,
      isConfidential: false,
      sign: null,
      activeStatus: null,
      sgId: null
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      activeStatus: yup.number().required(),
      description: yup.string().required(),
      sgId: yup
        .number()
        .nullable()
        .test('sgId-required-if-confidential', 'sgId is required when confidential', function (value) {
          const { isConfidential } = this.parent

          return !(isConfidential && !value)
        }),
      accountRef: yup
        .string()
        .required()
        .matches(/^[A-Za-z0-9-]+$/)
    }),
    onSubmit: async values => {
      const response = await postRequest({
        extension: GeneralLedgerRepository.ChartOfAccounts.set,
        record: JSON.stringify({
          ...values,
          segments: values.segments?.filter(segment => segment != null && segment !== '')
        })
      })

      toast.success(values.recordId ? platformLabels.Edited : platformLabels.Added)
      formik.setFieldValue('recordId', response.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    if (!recordId) return
    getRequest({
      extension: GeneralLedgerRepository.ChartOfAccounts.get,
      parameters: `_recordId=${recordId}`
    }).then(res => {
      formik.setValues(res.record)
    })
  }, [])

  return (
    <FormShell resourceId={ResourceIds.ChartOfAccounts} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={GeneralLedgerRepository.GLAccountGroups.qry}
                name='groupId'
                label={labels.group}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => formik && formik.setFieldValue('groupId', newValue?.recordId || null)}
                error={formik.touched.groupId && Boolean(formik.errors.groupId)}
              />
            </Grid>
            <Grid item xs={12}>
              <SegmentedInput
                name='accountRef'
                setFieldValue={formik.setFieldValue}
                value={formik.values.accountRef}
                onChange={({ segments, value }) => {
                  formik.setFieldValue('segments', segments)
                  formik.setFieldValue('accountRef', value)
                }}
                label={labels.accountRef}
                required
                maxAccess={maxAccess}
                error={formik.touched.accountRef && Boolean(formik.errors.accountRef)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                rows={2}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='description'
                label={labels.description}
                value={formik.values.description}
                required
                rows={2}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('description', '')}
                error={formik.touched.description && Boolean(formik.errors.description)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='activeStatus'
                label={labels.status}
                required
                datasetId={DataSets.ACTIVE_STATUS}
                values={formik.values}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('activeStatus', newValue?.key || null)
                }}
                error={formik.touched.activeStatus && Boolean(formik.errors.activeStatus)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='sign'
                label={labels.creditDebit}
                datasetId={DataSets.Sign}
                values={formik.values}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('sign', newValue?.key || null)
                }}
                error={formik.touched.sign && Boolean(formik.errors.sign)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='disableManualEntry'
                value={formik.values?.disableManualEntry}
                onChange={event => formik.setFieldValue('disableManualEntry', event.target.checked)}
                label={labels.disableManualEntry}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isConfidential'
                value={formik.values?.isConfidential}
                onChange={event => {
                  formik.setFieldValue('isConfidential', event.target.checked)
                  formik.setFieldValue('sgId', null)
                }}
                label={labels.isConfidential}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={AccessControlRepository.SecurityGroup.qry}
                parameters={`_startAt=0&_pageSize=1000&filter=`}
                name='sgId'
                label={labels.securityGrp}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('sgId', newValue?.recordId || null)
                }}
                required={formik.values.isConfidential}
                readOnly={!formik.values.isConfidential}
                error={formik.touched.sgId && Boolean(formik.errors.sgId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
