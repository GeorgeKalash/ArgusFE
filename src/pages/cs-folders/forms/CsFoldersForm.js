import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { SystemRepository } from 'src/repositories/SystemRepository'

export default function CsFoldersForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Folders.qry
  })

  const [loading, setLoading] = useState(false)

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      setLoading(true)
      try {
        const response = await postRequest({
          extension: SystemRepository.Folders.set,
          record: JSON.stringify(obj)
        })

        if (!obj.recordId) {
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', response.recordId)
        } else {
          toast.success(platformLabels.Edited)
        }

        await invalidate()
      } catch (error) {
        console.error('Save failed:', error)
        toast.error('Failed to save folder.')
      } finally {
        setLoading(false)
      }
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        try {
          const res = await getRequest({
            extension: SystemRepository.Folders.get,
            parameters: `_recordId=${recordId}`
          })

          if (res.record) {
            formik.setValues(res.record)
          } else {
            toast.error('Folder record not found')
          }
        } catch (error) {
          console.error('Fetch failed:', error)
          toast.error('Failed to load folder.')
        }
      }
    })()
  }, [recordId])

  return (
    <FormShell
      resourceId={ResourceIds.Folders}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      title="Folder"
      disabled={loading}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12} style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="name" style={{ marginRight: 8, minWidth: 60, fontWeight: 'bold' }}>
                    Name:
                </label>
              <CustomTextField
                name="name"
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
