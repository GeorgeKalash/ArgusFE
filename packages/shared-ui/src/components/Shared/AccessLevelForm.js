import { Grid } from '@mui/material'
import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form.js'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import CustomCheckBox from '../Inputs/CustomCheckBox'
import Form from './Form'

const AccessLevelForm = ({ labels, maxAccess, data, invalidate, moduleId, resourceId, window }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.AccessLevel, window })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
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
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grid container spacing={2}>
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
              name='accessFlags.reopen'
              value={formik.values?.accessFlags?.reopen}
              onChange={event => formik.setFieldValue('accessFlags.reopen', event.target.checked)}
              label={labels.reopen}
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
    </Form>
  )
}

AccessLevelForm.width = 450
AccessLevelForm.height = 300

export default AccessLevelForm
