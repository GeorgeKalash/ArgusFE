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
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'

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

      const keysToExtract = [
        'au_PlantSupervisorSG',
        'au_GlobalSupervisorSG',
        'au_PlantSupervisorSGName',
        'au_GlobalSupervisorSGName'
      ]

      const myObject = res.list.reduce((acc, { key, value }) => {
        if (keysToExtract.includes(key)) {
          acc[key] = value
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
              <ResourceLookup
                endpointId={AccessControlRepository.SecurityGroup.snapshotGRP}
                name='au_PlantSupervisorSGName'
                label={_labels.au_PlantSupervisorSG}
                valueField='name'
                displayField='name'
                secondDisplayField={false}
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('au_PlantSupervisorSG', newValue?.recordId || null)
                  formik.setFieldValue('au_PlantSupervisorSGName', newValue?.name || '')
                }}
                error={formik.touched.au_PlantSupervisorSGName && Boolean(formik.errors.au_PlantSupervisorSGName)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={AccessControlRepository.SecurityGroup.snapshotGRP}
                name='au_GlobalSupervisorSGName'
                label={_labels.au_GlobalSupervisorSG}
                valueField='name'
                displayField='name'
                secondDisplayField={false}
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('au_GlobalSupervisorSG', newValue?.recordId || null)
                  formik.setFieldValue('au_GlobalSupervisorSGName', newValue?.name || '')
                }}
                error={formik.touched.au_GlobalSupervisorSGName && Boolean(formik.errors.au_GlobalSupervisorSGName)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
