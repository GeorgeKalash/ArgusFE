import { Grid } from '@mui/material'
import { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { useForm } from 'src/hooks/form.js'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

export default function AccessLevelForm({ labels, maxAccess, data, invalidate, moduleId, resourceId, window }) {
  const { postRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      accessLevel: 0
    },
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async obj => {
      try {
        const updatedData = data.list.map(item => ({
          moduleId: moduleId,
          resourceId: item.resourceId || item.key,
          accessLevel: obj.accessLevel,
          sgId: item.sgId
        }))
        if (resourceId == ResourceIds.SecurityGroup) {
          updatedData.forEach(async item => {
            item.accessLevel = item.accessLevel || 0
            await postRequest({
              extension: AccessControlRepository.ModuleClass.set,
              record: JSON.stringify(item)
            })
          })
        }
        if (resourceId == ResourceIds.GlobalAuthorization) {
          updatedData.forEach(async item => {
            item.accessLevel = item.accessLevel || 0
            await postRequest({
              extension: AccessControlRepository.AuthorizationResourceGlobal.set,
              record: JSON.stringify(item)
            })
          })
        }
        toast.success('Record Edited Successfully')
        invalidate()
        window.close()
      } catch (error) {}
    }
  })

  return (
    <FormShell
      resourceId={ResourceIds.SecurityGroup}
      form={formik}
      height={400}
      maxAccess={maxAccess}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.ACCESS_LEVEL}
            name='accessLevel'
            label={labels.accessLevel}
            valueField='key'
            displayField='value'
            values={formik.values}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('accessLevel', newValue?.key)
            }}
            error={formik.touched.accessLevel && Boolean(formik.errors.accessLevel)}
          />
        </Grid>
      </VertLayout>
    </FormShell>
  )
}
