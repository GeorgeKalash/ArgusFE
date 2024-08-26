import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { DataSets } from 'src/resources/DataSets'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

export default function ReleaseIndicatorForm({ labels, maxAccess, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.ReleaseIndicator.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      reference: '',
      changeability: '',
      isReleased: false
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      recordId: yup.string().required(),
      changeability: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const recordId = obj.recordId

        const response = await postRequest({
          extension: DocumentReleaseRepository.ReleaseIndicator.set,
          record: JSON.stringify(obj)
        })

        if (!recordId) {
          toast.success(platformLabels.Added)
          formik.setValues({
            ...obj,
            recordId: response.recordId
          })
        } else toast.success(platformLabels.Edited)
        window.close()
        invalidate()
      } catch (error) {}
    }
  })

  const editMode = !!formik.values.recordId || (formik.values.recordId === 0)

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId >= 0) {
          const res = await getRequest({
            extension: DocumentReleaseRepository.ReleaseIndicator.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {
        setErrorMessage(error)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.ReleaseIndicators} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                readOnly={editMode}
                value={formik.values.reference}
                required
                maxAccess={maxAccess}
                maxLength='1'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                readOnly={editMode}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='recordId'
                label={labels.id}
                readOnly={editMode}
                value={formik.values.recordId}
                required
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('recordId', '')}
                error={formik.touched.recordId && Boolean(formik.errors.recordId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                readOnly={false}
                datasetId={DataSets.DR_CHANGEABILITY}
                name='changeability'
                label={labels.changeability}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('changeability', newValue?.key)
                }}
                error={formik.touched.changeability && Boolean(formik.errors.changeability)}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='isReleased'
                    maxAccess={maxAccess}
                    checked={formik.values?.isReleased}
                    onChange={formik.handleChange}
                  />
                }
                label={labels.isReleased}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
