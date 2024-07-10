import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { useInvalidate } from 'src/hooks/resource'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const GroupInfoTab = ({ labels, maxAccess, storeRecordId, setRecordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: { recordId: storeRecordId || null, name: '', description: '' },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required('This field is required')
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
          <Grid container spacing={4}>
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
