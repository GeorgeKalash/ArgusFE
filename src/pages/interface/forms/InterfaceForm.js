import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

export default function InterfaceForm({ labels, recordId, maxAccess }) {
  const [editMode, setEditMode] = useState(!!recordId)
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.Interface.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      reference: '',
      path: '',
      description: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      path: yup.string().required(),
      description: yup.string().required()
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: RemittanceSettingsRepository.Interface.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success(platformLabels.Edited)
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RemittanceSettingsRepository.Interface.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Interface} form={formik} height={300} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomNumberField
                name='recordId'
                label={labels.id}
                value={formik?.values?.recordId}
                decimalScale={0}
                thousandSeparator=''
                required
                onChange={formik.handleChange}
                maxLength='15'
                readOnly={editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('recordId', '')}
                error={formik.touched.recordId && Boolean(formik.errors.recordId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                onChange={formik.handleChange}
                maxLength='10'
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxLength='50'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='path'
                label={labels.path}
                value={formik.values.path}
                required
                maxLength='100'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('path', '')}
                error={formik.touched.path && Boolean(formik.errors.path)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='description'
                label={labels.description}
                value={formik.values.description}
                required
                maxLength='200'
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
