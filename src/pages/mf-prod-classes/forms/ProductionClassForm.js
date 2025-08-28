import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

export default function ProductionClassForm({ labels, maxAccess, recordId, setSelectedRecordId, editMode }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.ProductionClass.page
  })

  const formik = useFormik({
    initialValues: {
      recordId: null,
      reference: '',
      name: '',
      standardId: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: ManufacturingRepository.ProductionClass.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        formik.setFieldValue('recordId', response.recordId)
        setSelectedRecordId(response.recordId)
      }
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: ManufacturingRepository.ProductionClass.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({ ...res.record })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.ProductionClass} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                rows={2}
                maxLength='4'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
                helperText={formik.touched.reference && formik.errors.reference}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionStandard.qry}
                name='standardId'
                label={labels.prodStandard}
                valueField='recordId'
                displayField={'reference'}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('standardId', newValue?.recordId)
                }}
                error={formik.touched.standardId && Boolean(formik.errors.standardId)}
                helperText={formik.touched.standardId && formik.errors.standardId}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
