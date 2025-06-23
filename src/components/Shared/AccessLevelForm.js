import { Grid } from '@mui/material'
import { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form.js'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import CustomCheckBox from '../Inputs/CustomCheckBox'

export default function AccessLevelForm({ labels, maxAccess, data, invalidate, moduleId, resourceId, window }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      accessFlags: {
        get: false,
        add: false,
        edit: false,
        del: false,
        close: false,
        post: false,
        unpost: false
      }
    },
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async obj => {
      try {
        const updatedData = data.list.map(item => ({
          moduleId: moduleId,
          resourceId: item.resourceId || item.key,
          accessFlags: obj.accessFlags,
          sgId: item.sgId
        }))
        if (resourceId == ResourceIds.SecurityGroup) {
          updatedData.forEach(async item => {
            await postRequest({
              extension: AccessControlRepository.ModuleClass.set,
              record: JSON.stringify(item)
            })
          })
        }
        if (resourceId == ResourceIds.GlobalAuthorization) {
          updatedData.forEach(async item => {
            await postRequest({
              extension: AccessControlRepository.AuthorizationResourceGlobal.set,
              record: JSON.stringify(item)
            })
          })
        }
        toast.success(platformLabels.Edited)
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
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <CustomCheckBox
              name='accessFlags.get'
              value={formik.values?.accessFlags?.get}
              onChange={event => formik.setFieldValue('accessFlags.get', event.target.checked)}
              label={labels.get}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomCheckBox
              name='accessFlags.add'
              value={formik.values?.accessFlags?.add}
              onChange={event => formik.setFieldValue('accessFlags.add', event.target.checked)}
              label={labels.add}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomCheckBox
              name='accessFlags.edit'
              value={formik.values?.accessFlags?.edit}
              onChange={event => formik.setFieldValue('accessFlags.edit', event.target.checked)}
              label={labels.edit}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomCheckBox
              name='del'
              value={formik.values?.accessFlags?.del}
              onChange={event => formik.setFieldValue('accessFlags.del', event.target.checked)}
              label={labels.del}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomCheckBox
              name='accessFlags.close'
              value={formik.values?.accessFlags?.close}
              onChange={event => formik.setFieldValue('accessFlags.close', event.target.checked)}
              label={labels.close}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomCheckBox
              name='accessFlags.post'
              value={formik.values?.accessFlags?.post}
              onChange={event => formik.setFieldValue('accessFlags.post', event.target.checked)}
              label={labels.post}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomCheckBox
              name='accessFlags.unpost'
              value={formik.values?.accessFlags?.unpost}
              onChange={event => formik.setFieldValue('accessFlags.unpost', event.target.checked)}
              label={labels.unpost}
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}
