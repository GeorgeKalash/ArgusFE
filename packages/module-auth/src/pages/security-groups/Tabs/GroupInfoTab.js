import { Grid } from '@mui/material'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const GroupInfoTab = ({ labels, maxAccess, storeRecordId, setRecordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: { recordId: storeRecordId || null, name: '', description: '' },
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required()
    }),
    onSubmit: async values => {
      const res = await postRequest({
        extension: AccessControlRepository.SecurityGroup.set,
        record: JSON.stringify(values)
      })
      if (!values.recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...values,
          recordId: res.recordId
        })
        setRecordId(res?.recordId)
      } else {
        toast.success(platformLabels.Updated)
      }
      invalidate()
    }
  })

  const invalidate = useInvalidate({
    endpointId: AccessControlRepository.SecurityGroup.qry
  })

  useEffect(() => {
    ;(async function () {
      if (storeRecordId) {
        const res = await getRequest({
          extension: AccessControlRepository.SecurityGroup.get,
          parameters: `_recordId=${storeRecordId}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [storeRecordId])

  return (
    <FormShell
      resourceId={ResourceIds.SecurityGroup}
      form={formik}
      height={300}
      maxAccess={maxAccess}
      editMode={!!storeRecordId}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxLength='30'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='description'
                label={labels.description}
                value={formik.values.description}
                rows={3}
                maxLength='150'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('description', '')}
                error={formik.touched.description && Boolean(formik.errors.description)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default GroupInfoTab
