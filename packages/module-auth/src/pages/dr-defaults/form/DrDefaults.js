import { useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { AdministrationRepository } from '@argus/repositories/src/repositories/AdministrationRepository'

const DrDefault = ({ _labels, access }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  const drApprovalTemplateId = parseInt(defaultsData?.list?.find(({ key }) => key === 'drApprovalTemplateId')?.value) || null

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      drApprovalTemplateId
    },
    onSubmit: async obj => {
      const sysDefaults = Object.entries(obj).map(([key, value]) => ({ key, value }))

      await postRequest({
        extension: SystemRepository.Defaults.set,
        record: JSON.stringify({ sysDefaults })
      })

      updateDefaults(sysDefaults)
      toast.success(platformLabels.Edited)
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={AdministrationRepository.AdTemplate.qry}
                name='drApprovalTemplateId'
                label={_labels.drApprovalTemplate}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={access}
                onChange={(_, newValue) => formik.setFieldValue('drApprovalTemplateId', newValue?.recordId || null)}
                error={formik.touched.drApprovalTemplateId && Boolean(formik.errors.drApprovalTemplateId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default DrDefault
