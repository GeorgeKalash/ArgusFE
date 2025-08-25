import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

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
    <FormShell form={formik} isInfo={false} isCleared={false}>
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
    </FormShell>
  )
}
