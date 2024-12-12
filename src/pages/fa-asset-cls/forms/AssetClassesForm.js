import { Grid } from '@mui/material'
import { useContext, useEffect, useMemo, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { FixedAssetsRepository } from 'src/repositories/FixedAssetsRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { MasterSource } from 'src/resources/MasterSource'

export default function AssetClassesForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: FixedAssetsRepository.Asset.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: null,
      name: ''
    },
    maxAccess: maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: FixedAssetsRepository.Asset.set,
        record: JSON.stringify(obj)
      })
      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success(platformLabels.Edited)
      invalidate()
    }
  })
  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FixedAssetsRepository.Asset.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  const actions = [
    {
      key: 'Integration Account',
      condition: true,
      onClick: 'onClickGIA',
      disabled: !recordId && !formik.values.recordId
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.AssetClass}
      form={formik}
      maxAccess={maxAccess}
      editMode={!!recordId || !!formik.values.recordId}
      actions={actions}
      masterSource={MasterSource.AssetClass}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values?.reference}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                maxLength={10}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values?.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                maxLength={30}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
