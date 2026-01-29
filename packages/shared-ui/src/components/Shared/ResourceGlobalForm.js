import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form.js'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomCheckBox from '../Inputs/CustomCheckBox'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from './Form'

export default function ResourceGlobalForm({ labels, maxAccess, row, window, resourceId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.resourceGlobal, window })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      resourceId: row?.resourceId,
      resourceName: row?.resourceName,
      moduleId: row?.moduleId,
      sgId: row?.sgId,
      accessFlags: {
        get: false,
        add: false,
        edit: false,
        del: false,
        close: false,
        reopen: false,
        post: false,
        unpost: false
      }
    },
    validateOnChange: true,

    onSubmit: async obj => {
      if (resourceId == ResourceIds.SecurityGroup) {
        await postRequest({
          extension: AccessControlRepository.ModuleClass.set,
          record: JSON.stringify(obj)
        })
      }
      if (resourceId == ResourceIds.GlobalAuthorization) {
        await postRequest({
          extension: AccessControlRepository.AuthorizationResourceGlobal.set,
          record: JSON.stringify(obj)
        })
      }
      toast.success(platformLabels.Edited)
      window.close()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (row.resourceId) {
        if (resourceId == ResourceIds.GlobalAuthorization) {
          const res = await getRequest({
            extension: AccessControlRepository.AuthorizationResourceGlobal.get,
            parameters: `_resourceId=${row.resourceId}`
          })
          if (res.record) formik.setValues(res.record)
        } else if (resourceId == ResourceIds.SecurityGroup) {
          const res = await getRequest({
            extension: AccessControlRepository.ModuleClass.get,
            parameters: `_resourceId=${row.resourceId}&_sgId=${row.sgId}`
          })
          if (res.record) formik.setValues(res.record)
        }
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <CustomTextField
                name='resourceId'
                label={labels.resourceId}
                value={row?.resourceId}
                required
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                readOnly={true}
                onClear={() => formik.setFieldValue('resourceId', '')}
                error={formik.touched.resourceId && Boolean(formik.errors.resourceId)}
                helperText={formik.touched.resourceId && formik.errors.resourceId}
              />
            </Grid>
            <Grid item xs={8}>
              <CustomTextField
                name='resourceName'
                label={labels.resourceName}
                value={row?.resourceName}
                required
                readOnly={true}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('resourceName', '')}
                error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
                helperText={formik.touched.resourceName && formik.errors.resourceName}
              />
            </Grid>
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
                name='accessFlags.close'
                value={formik.values?.accessFlags?.close}
                onChange={event => formik.setFieldValue('accessFlags.close', event.target.checked)}
                label={labels.close}
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
                name='accessFlags.reopen'
                value={formik.values?.accessFlags?.reopen}
                onChange={event => formik.setFieldValue('accessFlags.reopen', event.target.checked)}
                label={labels.reopen}
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
                name='accessFlags.post'
                value={formik.values?.accessFlags?.post}
                onChange={event => formik.setFieldValue('accessFlags.post', event.target.checked)}
                label={labels.post}
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
                name='accessFlags.unpost'
                value={formik.values?.accessFlags?.unpost}
                onChange={event => formik.setFieldValue('accessFlags.unpost', event.target.checked)}
                label={labels.unpost}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

ResourceGlobalForm.width = 700
ResourceGlobalForm.height = 400
