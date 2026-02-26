import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function AUDefaultsForm({ _labels, access }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      au_PlantSupervisorSG: null,
      au_GlobalSupervisorSG: null
    },
    maxAccess: access,
    validateOnChange: true,
    onSubmit: async obj => {
      var data = []
      Object.entries(obj).forEach(([key, value]) => {
        const newObj = { key: key, value: value }
        data.push(newObj)
      })
      await postRequest({
        extension: SystemRepository.Defaults.set,
        record: JSON.stringify({ sysDefaults: data })
      })
      toast.success(platformLabels.Edited)
    }
  })

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: SystemRepository.Defaults.qry,
        parameters: `_filter=`
      })

      const keysToExtract = ['au_PlantSupervisorSG', 'au_GlobalSupervisorSG']

      const myObject = res.list.reduce((acc, { key, value }) => {
        if (keysToExtract.includes(key)) {
          acc[key] = value ? parseInt(value) : null
        }

        return acc
      }, {})

      formik.setValues(myObject)
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={AccessControlRepository.SecurityGroup.qry}
                parameters='_startAt=0&_pageSize=1000'
                name='au_PlantSupervisorSG'
                label={_labels.au_PlantSupervisorSG}
                displayField='name'
                valueField='recordId'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('au_PlantSupervisorSG', newValue?.recordId || null)
                }}
                maxAccess={access}
                error={formik.touched.au_PlantSupervisorSG && Boolean(formik.errors.au_PlantSupervisorSG)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={AccessControlRepository.SecurityGroup.qry}
                parameters='_startAt=0&_pageSize=1000'
                name='au_GlobalSupervisorSG'
                label={_labels.au_GlobalSupervisorSG}
                displayField='name'
                valueField='recordId'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('au_GlobalSupervisorSG', newValue?.recordId || null)
                }}
                maxAccess={access}
                error={formik.touched.au_GlobalSupervisorSG && Boolean(formik.errors.au_GlobalSupervisorSG)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
